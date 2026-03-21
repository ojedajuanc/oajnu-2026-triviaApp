import { DOM } from './dom.js';
import { DIFF } from '../config/constants.js';
import { escHtml } from '../utils.js';

/**
 * Renderiza la pantalla de audiencia a partir del estado recibido de Firebase.
 * Solo corre en pestañas con #audience en la URL.
 *
 * @param {{
 *   teams: Array,
 *   questions: Array,
 *   scores: object,
 *   timerLeft: number,
 *   timerDuration: number,
 *   timerRunning: boolean,
 *   currentQ: number,
 *   started: boolean,
 *   buzzedTeam: string|null
 * }} data
 */
export function renderAudienceView(data) {
  const { teams = [], questions = [], scores = {}, currentQ, started,
          buzzedTeam, timerLeft, timerDuration, timerRunning } = data;

  const q   = questions[currentQ];
  const pct = timerDuration > 0 ? (timerLeft / timerDuration) * 100 : 100;
  const timerState = pct < 30 ? 'danger' : pct < 60 ? 'warn' : '';

  // Contador de pregunta
  DOM.pubQnum.textContent = currentQ >= 0
    ? `Pregunta ${currentQ + 1} / ${questions.length}`
    : '—';

  // Categoría y dificultad
  DOM.pubMeta.textContent = q
    ? (q.cat ? q.cat + ' · ' : '') + (DIFF[q.diff]?.label || '')
    : 'OAJNU · Trivia';

  // Texto de la pregunta
  DOM.pubQ.textContent = q
    ? q.text
    : (started ? 'Preparando siguiente pregunta...' : 'Esperando al moderador...');

  // Imagen (si la tiene)
  if (q?.img) {
    DOM.pubImg.src           = q.img;
    DOM.pubImg.style.display = 'block';
  } else {
    DOM.pubImg.style.display = 'none';
  }

  // Timer
  DOM.pubTnum.textContent = (!timerRunning && timerLeft === timerDuration) ? '—' : timerLeft;
  DOM.pubTnum.className   = `pub-timer${timerState ? ' pub-timer--' + timerState : ''}`;
  DOM.pubBfill.style.width = `${pct}%`;
  DOM.pubBfill.className   = `pub-bar__fill${timerState ? ' pub-bar__fill--' + timerState : ''}`;

  // Equipo que buzzeó
  if (buzzedTeam) {
    const team = teams.find(t => t.name === buzzedTeam);
    DOM.pubBuzzed.textContent   = '🎯 ' + buzzedTeam;
    DOM.pubBuzzed.style.display = 'block';
    if (team) {
      DOM.pubBuzzed.style.background   = team.color + '33';
      DOM.pubBuzzed.style.borderColor  = team.color;
    }
  } else {
    DOM.pubBuzzed.style.display = 'none';
  }

  // Marcador
  const sorted = [...teams].sort((a, b) => (scores[b.name] || 0) - (scores[a.name] || 0));
  DOM.pubScores.innerHTML = sorted.map(t => `
    <div class="pub-score-item">
      <div class="pub-score-dot" style="background:${t.color}"></div>
      <span class="pub-score-name">${escHtml(t.name)}</span>
      <span class="pub-score-pts">${scores[t.name] || 0}</span>
    </div>`).join('');
}
