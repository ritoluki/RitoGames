/**
 * Tiny Web Audio beeps — no MP3 assets. Respects mute via caller.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

/** Call after first user gesture so browsers allow sound. */
export function resumeAudio(): void {
  void getCtx()?.resume();
}

function playTone(freq: number, durationSec: number, gain: number): void {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ctx.destination);
  const t0 = ctx.currentTime;
  osc.start(t0);
  osc.stop(t0 + durationSec);
}

export function playEatSound(): void {
  playTone(660, 0.04, 0.06);
}

export function playDieSound(): void {
  playTone(110, 0.12, 0.08);
}
