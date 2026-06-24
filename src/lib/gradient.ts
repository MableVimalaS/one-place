// Dreamy gradient "artwork" used as a fallback when an item has no thumbnail
// (e.g. Spotify tracks). Deterministic per id so a card always looks the same.

const PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['#7C3AED', '#5EEAD4'],
  ['#F472B6', '#7C3AED'],
  ['#3B82F6', '#5EEAD4'],
  ['#B388FF', '#FF8FB1'],
  ['#6366F1', '#22D3EE'],
  ['#EC4899', '#FB923C'],
  ['#8B5CF6', '#3B82F6'],
  ['#10B981', '#3B82F6'],
  ['#A855F7', '#EC4899'],
  ['#0EA5E9', '#A78BFA'],
]

export function gradientFor(seed: string): string {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  const [a, b] = PAIRS[hash % PAIRS.length]
  return `radial-gradient(120% 120% at 20% 15%, ${a}, ${b})`
}
