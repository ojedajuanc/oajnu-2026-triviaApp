import { DOM } from './dom.js';
import { DIFF } from '../config/constants.js';
import { escHtml, escAttr } from './utils.js';

/**
 * Renderiza la grilla de botones de buzzer.
 * @param {Array<{name: string, color: string}>} teams
 * @param {(teamName: string) => void} onBuzz
 * @param {Record<string, boolean>} answeredWrong equipos bloqueados este turno
 */
export function renderBuzzerGrid(teams, onBuzz, answeredWrong = {}) {
  DOM.buzzerGrid.innerHTML = teams.map((t, i) => {
    const blocked = !!answeredWrong[t.name];
    return `
      <button class="buzzer-btn ${blocked ? 'buzzer-btn--wrong' : ''}"
        data-team-index="${i}" ${blocked ? 'disabled' : ''}>
        <div class="team-dot" style="background:${t.color}"></div>
        <span>${escHtml(t.name)}</span>
        ${blocked ? '<span class="buzzer-btn__wrong-label">✗ ya respondió</span>' : ''}
      </button>`;
  }).join('');

  DOM.buzzerGrid.addEventListener('click', e => {
    const btn = e.target.closest('[data-team-index]:not([disabled])');
    if (btn) onBuzz(teams[parseInt(btn.dataset.teamIndex)].name);
  }, { once: true });
}

/**
 * Actualiza la tarjeta de la pregunta en juego.
 * @param {{ text, ans, explain, diff, pts, cat, img }} question
 * @param {number} index 0-based
 * @param {number} total
 */
export function renderQuestion(question, index, total) {
  DOM.qMain.textContent     = question.text;
  DOM.qAns.textContent      = '✓ ' + (question.ans || '(sin respuesta cargada)');
  DOM.qExplain.textContent  = question.explain || '';
  DOM.gQnum.textContent     = index + 1;
  DOM.gQtotal.textContent   = `de ${total} preguntas`;

  DOM.qMetaBar.innerHTML =
    `<span class="badge ${DIFF[question.diff].cssClass}">${DIFF[question.diff].label} · ${question.pts} pts</span>` +
    (question.cat ? `<span class="badge badge--cat">${escHtml(question.cat)}</span>` : '');

  if (question.img) {
    DOM.qImg.src            = question.img;
    DOM.qImg.style.display  = 'block';
  } else {
    DOM.qImg.style.display  = 'none';
  }

  // Ocultar respuesta y explicación hasta que el moderador las revele
  DOM.qAns.style.display    = 'none';
  DOM.qExplain.style.display = 'none';
}

/** Revela la respuesta y la explicación pedagógica */
export function revealAnswer(hasExplain) {
  DOM.qAns.style.display    = 'block';
  if (hasExplain) DOM.qExplain.style.display = 'block';
}

/**
 * Actualiza la barra del timer y el número.
 * @param {number} left segundos restantes
 * @param {number} duration duración total
 */
export function updateTimerDisplay(left, duration) {
  const pct   = duration > 0 ? (left / duration) * 100 : 0;
  const state = pct < 30 ? 'danger' : pct < 60 ? 'warn' : '';
  DOM.tFill.style.width = `${pct}%`;
  DOM.tFill.className   = `timer-bar__fill${state ? ' timer-bar__fill--' + state : ''}`;
  DOM.tNum.textContent  = left;
}

/** @param {'running'|'paused'|'idle'} state */
export function setTimerButtonState(state) {
  const labels   = { running: '⏸ Pausar', paused: '▶ Reanudar', idle: '▶ Iniciar timer' };
  const statuses = { running: 'Corriendo',  paused: 'Pausado',     idle: 'En espera'      };
  DOM.btnTimer.textContent    = labels[state];
  DOM.timerStatus.textContent = statuses[state];
}

export function setTimerStatusText(text) {
  DOM.timerStatus.textContent = text;
}

/**
 * Muestra el equipo que respondió primero.
 * @param {string} teamName
 * @param {{ color: string } | undefined} team
 * @param {number} questionPts
 */
export function showBuzzed(teamName, team, questionPts) {
  DOM.buzzedName.textContent = teamName;
  DOM.buzzedBox.classList.add('active');
  if (team) {
    DOM.buzzedBox.style.borderColor = team.color;
    DOM.buzzedBox.style.background  = team.color + '18';
  }
  DOM.judgeBtns.style.display = 'flex';
  DOM.ptsLbl.textContent      = questionPts;
}

/** Oculta el panel de buzzer y juicio */
export function clearBuzzed() {
  DOM.buzzedBox.classList.remove('active');
  DOM.judgeBtns.style.display   = 'none';
  DOM.comodinArea.style.display = 'none';
}

/** Resetea todos los elementos de UI al estado de "sin pregunta activa" */
export function resetGameUI() {
  clearBuzzed();
  DOM.qAns.style.display        = 'none';
  DOM.qExplain.style.display    = 'none';
  DOM.qImg.style.display        = 'none';
}

/**
 * Actualiza el comodín disponible para el equipo que buzzeó.
 * @param {number} jokersLeft
 */
export function updateJokerUI(jokersLeft) {
  DOM.comodinArea.style.display = 'block';
  DOM.jokerCount.textContent    = `(${jokersLeft} restante${jokersLeft !== 1 ? 's' : ''})`;
  document.getElementById('btn-joker').disabled = jokersLeft <= 0;
}