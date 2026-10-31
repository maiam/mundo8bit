export const CHUNK_SIZE = 12;
export const SEED = 808;
export function hash(x, z) {
  const n = Math.sin(x * 127.1 + z * 311.7 + SEED) * 43758.5453;
  return n - Math.floor(n);
}
export function heightAt(x, z) {
  return Math.sin(x * .14) * 1.25 + Math.cos(z * .17) * .95 + Math.sin((x + z) * .09) * .8;
}
export function chunkAt(x, z) { return [Math.floor(x / CHUNK_SIZE), Math.floor(z / CHUNK_SIZE)]; }
export function wantedChunks(x, z, radius = 2) {
  const [cx, cz] = chunkAt(x, z);
  const result = [];
  for (let dx = -radius; dx <= radius; dx++) for (let dz = -radius; dz <= radius; dz++) result.push([cx + dx, cz + dz]);
  return result;
}
