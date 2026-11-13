"use client";

import { MAX_NARRATION_LENGTH, NARRATION_VERSION, normalizeNarration } from "./voice-config";

type SpeechOptions = {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  /** Ends on completion, cancellation, or unavailable playback. */
  onEnd?: () => void;
};

type Playback = {
  generation: number;
  controller: AbortController;
  options: SpeechOptions;
  release: () => void;
  timer: number | null;
  started: boolean;
  mode: "loading" | "audio" | "browser";
};

let cachedVoice: SpeechSynthesisVoice | null = null;
let player: HTMLAudioElement | null = null;
let generation = 0;
let active: Playback | null = null;
let audioUnlocked = false;
let cachedBytes = 0;
const audioCache = new Map<string, Blob>();
const MAX_CACHE_LINES = 24;
const MAX_CACHE_BYTES = 12 * 1024 * 1024;
// A tiny silent WAV primes this same media element inside a real gesture.
const SILENCE = "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";

// Web Speech exposes no gender field. Prefer established male English voices
// by name; an unlabelled provider voice is only a neutral fallback.
const ENGLISH_VOICE = /^en(?:[-_]|$)/i;
const MALE_VOICE = /\b(male|guy|ryan|david|mark|daniel|alex|george|james|aaron|arthur|fred|tom|rishi|oliver|christopher|roger|eric|andrew|brian)\b/i;

function browserSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function mediaSupported(): boolean {
  return typeof window !== "undefined" && typeof window.Audio === "function" && typeof URL.createObjectURL === "function";
}

export function speechSupported(): boolean {
  return mediaSupported() || browserSpeechSupported();
}

function getPlayer(): HTMLAudioElement | null {
  if (!mediaSupported()) return null;
  if (!player) {
    player = new window.Audio();
    player.hidden = true;
    player.preload = "auto";
    player.setAttribute("playsinline", "");
    player.setAttribute("aria-hidden", "true");
    player.setAttribute("data-afterlight-narration", "");
    player.volume = 0.95;
    document.body.appendChild(player);
  }
  return player;
}

function current(playback: Playback): boolean {
  return active === playback && generation === playback.generation;
}

function notify(callback?: () => void) {
  try { callback?.(); } catch { /* narration never blocks the interface */ }
}

function clearTimer(playback: Playback) {
  if (playback.timer !== null) window.clearTimeout(playback.timer);
  playback.timer = null;
}

function started(playback: Playback) {
  if (!current(playback) || playback.started) return;
  playback.started = true;
  notify(playback.options.onStart);
}

function finish(playback: Playback) {
  if (!current(playback)) return;
  active = null;
  clearTimer(playback);
  playback.release();
  notify(playback.options.onEnd);
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!browserSpeechSupported()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices().filter((voice) => ENGLISH_VOICE.test(voice.lang));
  if (!voices.length) return null;
  voices.sort((a, b) =>
    Number(b.default) - Number(a.default) ||
    Number(b.localService) - Number(a.localService) ||
    a.lang.localeCompare(b.lang) ||
    a.name.localeCompare(b.name) ||
    a.voiceURI.localeCompare(b.voiceURI),
  );
  cachedVoice = voices.find((voice) => MALE_VOICE.test(voice.name)) ?? voices[0];
  return cachedVoice;
}

function browserFallback(playback: Playback, line: string) {
  if (!current(playback) || playback.mode === "browser") return;
  playback.mode = "browser";
  clearTimer(playback);
  playback.release();
  playback.release = () => {};
  if (!browserSpeechSupported()) { finish(playback); return; }
  try {
    const utter = new SpeechSynthesisUtterance(line);
    const voice = pickVoice();
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang ?? "en-US";
    utter.rate = playback.options.rate ?? 1.02;
    utter.pitch = playback.options.pitch ?? 1;
    utter.volume = 0.95;
    utter.onstart = () => started(playback);
    utter.onend = utter.onerror = () => finish(playback);
    window.speechSynthesis.speak(utter);
  } catch {
    // Browsers can refuse speech without a gesture; subtitles remain available.
    finish(playback);
  }
}

function rememberAudio(line: string, blob: Blob) {
  if (blob.size > MAX_CACHE_BYTES) return;
  const previous = audioCache.get(line);
  if (previous) { cachedBytes -= previous.size; audioCache.delete(line); }
  audioCache.set(line, blob);
  cachedBytes += blob.size;
  while (audioCache.size > MAX_CACHE_LINES || cachedBytes > MAX_CACHE_BYTES) {
    const oldest = audioCache.keys().next().value;
    if (oldest === undefined) break;
    cachedBytes -= audioCache.get(oldest)!.size;
    audioCache.delete(oldest);
  }
}

async function playAudio(playback: Playback, line: string, blob: Blob) {
  if (!current(playback)) return;
  const audio = getPlayer();
  if (!audio) { browserFallback(playback, line); return; }
  playback.mode = "audio";
  const url = URL.createObjectURL(blob);
  let released = false;
  playback.release = () => {
    if (released) return;
    released = true;
    audio.onplaying = audio.onended = audio.onerror = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    URL.revokeObjectURL(url);
  };
  audio.src = url;
  audio.playbackRate = playback.options.rate ?? 1;
  audio.onplaying = () => started(playback);
  audio.onended = () => finish(playback);
  audio.onerror = () => browserFallback(playback, line);
  try {
    await audio.play();
    if (current(playback)) audioUnlocked = true;
  } catch (error) {
    if (!current(playback) || playback.mode !== "audio") return;
    const name = (error as { name?: string })?.name;
    if (name === "NotAllowedError" || name === "SecurityError" || name === "AbortError") {
      audioUnlocked = false;
      // Do not queue another voice after autoplay denial. Replay is explicit.
      finish(playback);
    } else {
      browserFallback(playback, line);
    }
  }
}

async function loadAudio(playback: Playback, line: string) {
  try {
    const cached = audioCache.get(line);
    if (cached) {
      audioCache.delete(line);
      audioCache.set(line, cached);
      await playAudio(playback, line, cached);
      return;
    }
    playback.timer = window.setTimeout(() => playback.controller.abort(), 22000);
    const response = await fetch(`/api/voice?v=${NARRATION_VERSION}&text=${encodeURIComponent(line)}`, {
      signal: playback.controller.signal,
    });
    if (!current(playback)) return;
    if (!response.ok || !response.headers.get("Content-Type")?.startsWith("audio/")) throw new Error("Narration unavailable");
    const blob = await response.blob();
    if (!current(playback)) return;
    if (playback.controller.signal.aborted || !blob.size) throw new Error("Narration unavailable");
    clearTimer(playback);
    rememberAudio(line, blob);
    await playAudio(playback, line, blob);
  } catch {
    // Superseded/muted requests cannot reach fallback or start delayed audio.
    if (current(playback)) browserFallback(playback, line);
  } finally {
    clearTimer(playback);
  }
}

/** Starts one narration and returns a cancel function scoped to that request. */
export function speak(text: string, opts: SpeechOptions = {}): () => void {
  const line = normalizeNarration(text);
  if (!line || !speechSupported()) return () => {};
  stopSpeech();
  const playback: Playback = {
    generation: ++generation, controller: new AbortController(), options: opts,
    release: () => {}, timer: null, started: false, mode: "loading",
  };
  active = playback;
  if (mediaSupported() && line.length <= MAX_NARRATION_LENGTH) void loadAudio(playback, line);
  else browserFallback(playback, line);
  return () => { if (current(playback)) stopSpeech(); };
}

export function stopSpeech() {
  const playback = active;
  active = null;
  generation += 1;
  if (playback) {
    clearTimer(playback);
    playback.controller.abort();
    playback.release();
    notify(playback.options.onEnd);
  }
  if (browserSpeechSupported()) {
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
  }
}

if (typeof window !== "undefined") {
  const unlock = (event: Event) => {
    if (!event.isTrusted || audioUnlocked || (active && player?.src.startsWith("blob:"))) return;
    try {
      const audio = getPlayer();
      if (!audio) return;
      audio.src = SILENCE;
      void audio.play().then(() => {
        audioUnlocked = true;
        // A response may have arrived since the gesture. Never pause it here.
        if (!active && audio.src === SILENCE) audio.pause();
      }).catch(() => { /* a later real gesture can retry the silent unlock */ });
    } catch { /* media support may be restricted; narration is optional */ }
  };
  for (const event of ["pointerup", "touchend", "keydown"]) {
    document.addEventListener(event, unlock, { capture: true, passive: true });
  }
  window.addEventListener("pagehide", stopSpeech);
  if (browserSpeechSupported()) {
    try {
      window.speechSynthesis.addEventListener("voiceschanged", () => { cachedVoice = null; });
    } catch { /* voice enumeration may be unavailable */ }
  }
}
