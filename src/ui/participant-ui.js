import { escHtml } from '../utils.js';
import { DIFF } from '../config/constants.js';

const $ = id => document.getElementById(id);

/**
 * Renderiza la pantalla del participante a partir del estado de Firebase.
 * @param {object} data  estado del juego
 * @param {string} myTeam nombre del equipo del participante
 */
export function renderParticipantView(data, myTeam) {
  const { teams = [], questions = [], scores = {}, currentQ,
          timerLeft, timerDuration, timerRunning, buzzedTeam, started } = data;

  const q = questions[currentQ];

  // Pregunta
  $('part-question').textContent = q
    ? q.text
    : (started ? 'Preparando siguiente pregunta...' : 'Esperando al moderador...');

  // Timer
  const pct   = timerDuration > 0 ? (timerLeft / timerDuration) * 100 : 100;
  const state = pct < 30 ? 'danger' : pct < 60 ? 'warn' : '';
  $('part-timer').textContent = (!timerRunning && timerLeft === timerDuration) ? '—' : timerLeft;
  $('part-timer').className   = `part-timer${state ? ' part-timer--' + state : ''}`;

  // Estado del botón de buzz
  const buzzBtn    = $('part-buzz-btn');
  const buzzStatus = $('part-buzz-status');

  if (!q || !started) {
    buzzBtn.disabled = true;
    buzzBtn.classList.remove('part-buzz-btn--fired');
    buzzStatus.textContent = '';
    buzzStatus.className   = 'part-buzz-status';
  } else if (buzzedTeam) {
    buzzBtn.disabled = true;
    if (buzzedTeam === myTeam) {
      buzzBtn.classList.add('part-buzz-btn--fired');
      buzzStatus.textContent = '¡Fuiste el primero!';
      buzzStatus.className   = 'part-buzz-status part-buzz-status--first';
    } else {
      buzzBtn.classList.remove('part-buzz-btn--fired');
      buzzStatus.textContent = `Respondió ${buzzedTeam}`;
      buzzStatus.className   = 'part-buzz-status part-buzz-status--late';
    }
  } else {
    buzzBtn.disabled = false;
    buzzBtn.classList.remove('part-buzz-btn--fired');
    buzzStatus.textContent = '';
    buzzStatus.className   = 'part-buzz-status';
  }

  // Marcador
  const sorted = [...teams].sort((a, b) => (scores[b.name] || 0) - (scores[a.name] || 0));
  $('part-scores').innerHTML = sorted.map(t => `
    <div class="part-score-item ${t.name === myTeam ? 'part-score-item--me' : ''}">
      <div class="team-dot" style="background:${t.color}"></div>
      <span class="part-score-name">${escHtml(t.name)}${t.name === myTeam ? ' (vos)' : ''}</span>
      <span class="part-score-pts">${scores[t.name] || 0}</span>
    </div>`).join('');
}

/**
 * Renderiza los botones de selección de equipo.
 * @param {Array<{name, color}>} teams
 * @param {(teamName: string) => void} onSelect
 */
export function renderTeamSelector(teams, onSelect) {
  $('part-teams').innerHTML = teams.map(t => `
    <button class="part-team-btn" data-team="${escHtml(t.name)}">
      <div class="team-dot" style="background:${t.color}"></div>
      ${escHtml(t.name)}
    </button>`).join('');

  $('part-teams').addEventListener('click', e => {
    const btn = e.target.closest('[data-team]');
    if (btn) onSelect(btn.dataset.team);
  });
}

/** Transiciona de la pantalla de selección de equipo a la de juego. */
export function showGameView(teamName, teamColor) {
  $('part-join').style.display = 'none';
  $('part-game').style.display = 'flex';
  const badge = $('part-team-badge');
  badge.textContent   = teamName;
  badge.style.background = teamColor;
}