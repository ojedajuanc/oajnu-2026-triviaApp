import { DIFF, PENALTY_PTS } from '../config/constants.js';

/**
 * Estado de la partida en curso.
 *
 * — Estado público: se serializa y envía a Firebase.
 * — Estado privado (prefijo _): solo el moderador lo necesita.
 */

// Estado público
export let teams              = [];
export let questions          = [];
export let timerDuration      = 30;
export let currentQ           = -1;
export let started            = false;
export let questionVisible    = false;
export let buzzedTeam         = null;
export let scores             = {};
export let teamsAnsweredWrong = {};
export let gameOver           = false;

// Estado privado (moderador)
export let _correct      = {};
export let _wrong        = {};
export let _jokers       = {};
export let _catScores    = {};
export let _history      = [];
export let _judged       = false;

// ── Mutadores ────────────────────────────────────────────

export function setCurrentQ(n)          { currentQ = n; }
export function setStarted(v)           { started = v; }
export function setQuestionVisible(v)   { questionVisible = v; }
export function setBuzzedTeam(name)     { buzzedTeam = name; }
export function setJudged(v)            { _judged = v; }
export function setGameOver(v)          { gameOver = v; }

/** Marca un equipo como que ya respondió mal en este turno */
export function markAnsweredWrong(teamName) {
  teamsAnsweredWrong = { ...teamsAnsweredWrong, [teamName]: true };
}

/** Limpia los equipos que respondieron mal (al avanzar pregunta) */
export function clearAnsweredWrong() {
  teamsAnsweredWrong = {};
}

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

export function initGame(setupState) {
  teams              = setupState.teams;
  timerDuration      = setupState.timerDuration;
  currentQ           = -1;
  started            = false;
  questionVisible    = false;
  buzzedTeam         = null;
  gameOver           = false;
  teamsAnsweredWrong = {};
  _judged            = false;
  _history           = [];

  questions = setupState.questions.map(q => ({ ...q, img: null }));

  scores = {}; _correct = {}; _wrong = {}; _jokers = {}; _catScores = {};
  setupState.teams.forEach(t => {
    scores[t.name]     = 0;
    _correct[t.name]   = 0;
    _wrong[t.name]     = 0;
    _jokers[t.name]    = setupState.jokersPerTeam;
    _catScores[t.name] = {};
    setupState.cats.forEach(c => { _catScores[t.name][c] = 0; });
  });
}

export function toFirebasePayload(timerState, meta = {}) {
  return {
    teams,
    questions,
    timerDuration,
    timerLeft:          timerState.left,
    timerRunning:       timerState.running,
    currentQ,
    started,
    questionVisible,
    buzzedTeam,
    scores,
    teamsAnsweredWrong,
    gameOver,
    buzzMode:  meta.buzzMode  || 'moderator',
    salaCode:  meta.salaCode  || null,
  };
}

export function calcDelta(isCorrect, questionPts) {
  return isCorrect ? questionPts : PENALTY_PTS;
}