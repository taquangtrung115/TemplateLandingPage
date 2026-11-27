export function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  return typeof window.WebGL2RenderingContext === 'function';
}
