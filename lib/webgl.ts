let cachedWebGLSupport: boolean | null = null;

/** Three's renderer requires WebGL2. Release the probe before R3F mounts. */
export function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;

  let context: WebGL2RenderingContext | null = null;
  try {
    const canvas = document.createElement("canvas");
    context = canvas.getContext("webgl2");
    cachedWebGLSupport = Boolean(context);
  } catch {
    cachedWebGLSupport = false;
  } finally {
    context?.getExtension("WEBGL_lose_context")?.loseContext();
  }

  return cachedWebGLSupport;
}
