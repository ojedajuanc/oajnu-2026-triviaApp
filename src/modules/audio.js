/**
 * Módulo de audio.
 * Genera sonidos con Web Audio API — sin dependencias externas.
 */

/** @type {AudioContext | null} Reutilizamos el contexto para evitar límites del navegador */
let _ctx = null;

function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
}

/**
 * Reproduce un sonido predefinido.
 * @param {'buzz' | 'correct' | 'wrong' | 'timeout' | 'next'} name
 */
export function playSound(name) {
  try {
    const ctx  = getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const t = ctx.currentTime;
    const sounds = {
      buzz: () => {
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.3);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.3);
      },
      correct: () => {
        osc.type = 'triangle';
        [523, 659, 784].forEach((f, i) => osc.frequency.setValueAtTime(f, t + i * 0.1));
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t); osc.stop(t + 0.4);
      },
      wrong: () => {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.setValueAtTime(150, t + 0.15);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.3);
      },
      timeout: () => {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.5);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t); osc.stop(t + 0.5);
      },
      next: () => {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t); osc.stop(t + 0.2);
      },
    };

    sounds[name]?.();
  } catch {
    // AudioContext no soportado o bloqueado por política del navegador — ignorar silenciosamente
  }
}
