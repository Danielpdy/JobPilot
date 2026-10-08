// Phones only let audio start inside a tap. Call unlockAudio() synchronously in a
// click/submit handler (before any await); the interviewer's voice then plays through
// this one shared context, which the tap has already allowed to run.
let ctx = null;

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx || ctx.state === 'closed') {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function unlockAudio() {
  const c = getAudioContext();
  if (c) {
    c.resume?.().catch(() => {});
    // iOS Safari only fully unlocks once something has actually played
    try {
      const src = c.createBufferSource();
      src.buffer = c.createBuffer(1, 1, 22050);
      src.connect(c.destination);
      src.start(0);
    } catch { /* nothing to unlock */ }
  }
  // Same for the browser voice used as a fallback
  try { window.speechSynthesis?.speak(new SpeechSynthesisUtterance('')); } catch { /* unsupported */ }
}
