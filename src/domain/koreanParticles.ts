export function directionParticle(word: string): "로" | "으로" {
  const lastCharacter = word.trim().at(-1);
  if (!lastCharacter) return "로";
  const codePoint = lastCharacter.codePointAt(0) ?? 0;
  const hangulStart = 0xac00;
  const hangulEnd = 0xd7a3;
  if (codePoint < hangulStart || codePoint > hangulEnd) return "로";
  const finalConsonant = (codePoint - hangulStart) % 28;
  return finalConsonant === 0 || finalConsonant === 8 ? "로" : "으로";
}
