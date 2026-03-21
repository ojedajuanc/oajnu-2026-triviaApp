/**
 * Módulo de timer.
 * Lógica pura del countdown — sin tocar el DOM.
 * El caller es responsable de actualizar la UI y de publicar a Firebase.
 */

/** @type {{ interval: ReturnType<typeof setInterval> | null, running: boolean, left: number }} */
const state = {
  interval: null,
  running:  false,
  left:     0,
};

/** @type {(() => void) | null} Callback invocado en cada tick */
let onTick     = null;
/** @type {(() => void) | null} Callback invocado cuando llega a 0 */
let onTimeout  = null;

/**
 * Configura los callbacks del timer.
 * @param {{ onTick: () => void, onTimeout: () => void }} callbacks
 */
export function configureTimer(callbacks) {
  onTick    = callbacks.onTick;
  onTimeout = callbacks.onTimeout;
}

/** Snapshot inmutable del estado actual — para que el caller pueda leerlo sin mutarlo */
export function getTimerState() {
  return { left: state.left, running: state.running };
}

/**
 * Inicia el timer desde cero con la duración indicada.
 * @param {number} duration segundos
 */
export function startTimer(duration) {
  state.left    = duration;
  state.running = true;
  _run();
}

export function resumeTimer() {
  if (state.running) return;
  state.running = true;
  _run();
}

export function pauseTimer() {
  state.running = false;
  clearInterval(state.interval);
}

export function stopTimer() {
  state.running = false;
  clearInterval(state.interval);
}

/**
 * Reinicia el tiempo restante a la duración dada sin arrancar el tick.
 * @param {number} duration
 */
export function resetTimer(duration) {
  stopTimer();
  state.left = duration;
}

function _run() {
  clearInterval(state.interval);
  state.interval = setInterval(() => {
    if (state.left <= 0) {
      stopTimer();
      onTimeout?.();
      return;
    }
    state.left--;
    onTick?.();
  }, 1000);
}
