export function canRevealNextFrame(
  revealedFrameIndex: number,
  currentObservationCount: number,
  totalFrames: number,
): boolean {
  return revealedFrameIndex < totalFrames - 1 && currentObservationCount >= 1;
}

export function revealNextFrame(
  revealedFrameIndex: number,
  currentObservationCount: number,
  totalFrames: number,
): number {
  return canRevealNextFrame(revealedFrameIndex, currentObservationCount, totalFrames)
    ? revealedFrameIndex + 1
    : revealedFrameIndex;
}
