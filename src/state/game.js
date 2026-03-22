import { DIFF, PENALTY_PTS } from '../config/constants.js';

/**
 * Estado de la partida en curso.
 *
 * Separamos en dos capas:
 *
 * — Estado público: se serializa y envía a Firebase para que la pantalla
 *   de audiencia lo renderice. Solo incluye lo mínimo necesario.
 *
 * — Estado privado (prefijo _): estadísticas y control local del moderador.
 *   Nunca viaja a Firebase.
 */

// Estado público
export let teams         = [];
export let questions     = [];   // sin imágenes — se strips antes de guardar en Firebase
export let timerDuration = 30;
export let currentQ      = -1;
export let started       = false;
export let buzzedTeam    = null;
export let scores        = {};

// Estado privado (moderador)
export let _correct      = {};
export let _wrong        = {};
export let _jokers       = {};
export let _catScores    = {};
export let _history      = [];
export let _judged       = false;

// ── Mutadores ────────────────────────────────────────────

export function setCurrentQ(n)      { currentQ = n; }
export function setStarted(v)       { started = v; }
export function setBuzzedTeam(name) { buzzedTeam = name; }
export function setJudged(v)        { _judged = v; }

export function applyScore(teamName, delta) {
  scores = { ...scores, [teamName]: (scores[teamName] || 0) + delta };
}

export function recordJudgment({ teamName, questionIndex, isCorrect, delta, cat }) {
  if (isCorrect) {
    _correct = { ..._correct, [teamName]: (_correct[teamName] || 0) + 1 };
    if (cat) {
      _catScores = {
        ..._catScores,
        [teamName]: {
          ..._catScores[teamName],
          [cat]: (_catScores[teamName]?.[cat] || 0) + delta,
        },
      };
    }
  } else {
    _wrong = { ..._wrong, [teamName]: (_wrong[teamName] || 0) + 1 };
  }
  _history = [..._history, { q: questionIndex, team: teamName, correct: isCorrect, delta }];
}

export function consumeJoker(teamName) {
  _jokers = { ..._jokers, [teamName]: (_jokers[teamName] || 0) - 1 };
}

/**
 * Inicializa el estado de juego a partir de la configuración de setup.
 * @param {object} setupState
 */
export function initGame(setupState) {
  teams         = setupState.teams;
  timerDuration = setupState.timerDuration;
  currentQ      = -1;
  started       = false;
  buzzedTeam    = null;
  _judged       = false;
  _history      = [];

  // Preguntas sin imágenes para Firebase — las imágenes quedan en setupState.questions
  questions = setupState.questions.map(q => ({ ...q, img: null }));

  scores = {}; _correct = {}; _wrong = {}; _jokers = {}; _catScores = {};
  setupState.teams.forEach(t => {
    scores[t.name]    = 0;
    _correct[t.name]  = 0;
    _wrong[t.name]    = 0;
    _jokers[t.name]   = setupState.jokersPerTeam;
    _catScores[t.name] = {};
    setupState.cats.forEach(c => { _catScores[t.name][c] = 0; });
  });
}

/**
 * Serializa el estado público para enviarlo a Firebase.
 * Solo incluye lo que la pantalla de audiencia y los participantes necesitan.
 * @param {{ left: number, running: boolean }} timerState
 * @param {{ buzzMode: string, salaCode: string }} meta
 * @returns {object}
 */
export function toFirebasePayload(timerState, meta = {}) {
  return {
    teams,
    questions,
    timerDuration,
    timerLeft:    timerState.left,
    timerRunning: timerState.running,
    currentQ,
    started,
    buzzedTeam,
    scores,
    buzzMode:  meta.buzzMode  || 'moderator',
    salaCode:  meta.salaCode  || null,
  };
}

/**
 * Calcula el delta de puntos para un juicio.
 * @param {boolean} isCorrect
 * @param {number} questionPts
 */
export function calcDelta(isCorrect, questionPts) {
  return isCorrect ? questionPts : PENALTY_PTS;
}