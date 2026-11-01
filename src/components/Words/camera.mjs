export const initialCamera = () => ({
  x: 0,
  y: 0,
  scale: 1
});
export function zoomAt(camera, scale, point) {
  const next = Math.max(0.4, Math.min(2, scale));
  const ratio = next / camera.scale;
  return {
    scale: next,
    x: point.x - (point.x - camera.x) * ratio,
    y: point.y - (point.y - camera.y) * ratio
  };
}
