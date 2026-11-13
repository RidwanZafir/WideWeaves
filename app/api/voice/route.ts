import { isNarrationAllowed } from "@/lib/narration-corpus";
import { MAX_NARRATION_LENGTH, NARRATION_VERSION, normalizeNarration } from "@/lib/voice-config";

export const runtime = "nodejs";
export const maxDuration = 30;

const VOICE_ID = "SOYHLrjzK2X1ezoPC6cr"; // Harry, selected by the user.
const MODEL_ID = "eleven_flash_v2_5";
const inFlight = new Map<string, Promise<AudioResult>>();
const failures = new Map<string, { until: number; status: 429 | 503 }>();

type AudioResult = { bytes: ArrayBuffer } | { status: 429 | 503; retryAfter?: number };

function unavailable(status: number, retryAfter?: number): Response {
  return Response.json({ error: "Narration unavailable" }, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
    },
  });
}

async function generateAudio(text: string, apiKey: string): Promise<AudioResult> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: { stability: 0.4, similarity_boost: 0.75, speed: 1.03 },
        }),
        // Next persistently caches successful POST audio by URL, headers and body.
        // A student's navigation abort must not discard a paid generation/cache write.
        cache: "force-cache",
        next: { revalidate: false },
        signal: AbortSignal.timeout(23000),
      },
    );
    if (!response.ok) {
      if ([401, 402, 403, 429].includes(response.status)) {
        const status = response.status === 429 ? 429 : 503;
        if (failures.size >= 64) failures.delete(failures.keys().next().value!);
        failures.set(text, { until: Date.now() + 60000, status });
        return { status, retryAfter: 60 };
      }
      return { status: 503 };
    }
    if (!response.headers.get("content-type")?.startsWith("audio/mpeg")) return { status: 503 };
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > 1000000) return { status: 503 };
    return { bytes };
  } catch {
    // Provider details and credentials are never sent to the browser.
    return { status: 503 };
  }
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const rawText = params.get("text") ?? "";
  if (params.get("v") !== NARRATION_VERSION || rawText.length > MAX_NARRATION_LENGTH) {
    return unavailable(400);
  }
  const text = normalizeNarration(rawText);
  // This is a curated narration service, never an arbitrary billed TTS relay.
  if (!text || !isNarrationAllowed(text)) return unavailable(400);
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return unavailable(503);
  const failure = failures.get(text);
  if (failure && Date.now() < failure.until) {
    return unavailable(failure.status, Math.max(1, Math.ceil((failure.until - Date.now()) / 1000)));
  }
  failures.delete(text);

  let pending = inFlight.get(text);
  if (!pending) {
    pending = generateAudio(text, apiKey);
    inFlight.set(text, pending);
    void pending.finally(() => inFlight.delete(text));
  }
  const result = await pending;
  if (!("bytes" in result)) return unavailable(result.status, result.retryAfter);
  return new Response(result.bytes, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(result.bytes.byteLength),
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// Link previews and media metadata probes must not trigger billed synthesis.
export async function HEAD(): Promise<Response> {
  return new Response(null, { status: 405, headers: { Allow: "GET", "Cache-Control": "no-store" } });
}
