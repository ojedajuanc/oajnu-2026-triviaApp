/**
 * Estado de configuración del juego.
 * Solo muta durante la pantalla de setup, antes de iniciar la partida.
 */

/** @type {'grupos' | 'sedes'} */
export let mode = 'grupos';

/** @type {Array<{ name: string, color: string }>} */
export let teams = [];

/** @type {Array<{ text, ans, explain, diff, pts, cat, img }>} */
export let questions = [];

/** @type {string[]} */
export let cats = [];

export let timerDuration = 30;
export let jokersPerTeam = 1;

/** Imagen pendiente para la próxima pregunta manual */
export let pendingImg = null;

// ── Setters ───────────────────────────────────────────────

export function setMode(m)              { mode = m; }
export function setTeams(t)             { teams = t; }
export function setTimerDuration(n)     { timerDuration = n; }
export function setJokersPerTeam(n)     { jokersPerTeam = n; }
export function setPendingImg(data)     { pendingImg = data; }
export function clearPendingImg()       { pendingImg = null; }

export function addTeam(team)           { teams = [...teams, team]; }
export function removeTeam(index)       { teams = teams.filter((_, i) => i !== index); }

export function addQuestion(q)          { questions = [...questions, q]; }
export function removeQuestion(index)   { questions = questions.filter((_, i) => i !== index); }

export function addCat(name)            { cats = [...cats, name]; }
export function removeCat(index)        { cats = cats.filter((_, i) => i !== index); }

/** Resetea todo el estado de setup a sus valores iniciales */
export function resetSetup() {
  mode          = 'grupos';
  teams         = [];
  questions     = [];
  cats          = [];
  timerDuration = 30;
  jokersPerTeam = 1;
  pendingImg    = null;
}
