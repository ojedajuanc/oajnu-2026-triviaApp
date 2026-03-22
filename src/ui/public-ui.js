import { DOM } from './dom.js';
import { DIFF } from '../config/constants.js';
import { escHtml } from './utils.js';

export function renderAudienceView(data) {
  const { teams = [], questions = [], scores = {}, currentQ, started,
          buzzedTeam, timerLeft, timerDuration, timerRunning,
          questionVisible, gameOver } = data;

  // ── Pantalla de resultados finales (gameOver) ──────────────
  if (gameOver) {
    renderAudienceResults(teams, scores);
    return;
  }

  const q   = questions[currentQ];
  const pct = timerDuration > 0 ? (timerLeft / timerDuration) * 100 : 100;
  const timerState = pct < 30 ? 'danger' : pct < 60 ? 'warn' : '';

  DOM.pubQnum.textContent = currentQ >= 0
    ? `Pregunta ${currentQ + 1} / ${questions.length}`
    : '—';

  DOM.pubMeta.textContent = q && questionVisible
    ? (q.cat ? q.cat + ' · ' : '') + (DIFF[q.diff]?.label || '')
    : 'OAJNU · Trivia';

  // La pregunta solo se muestra cuando el moderador arranca el timer
  if (q && questionVisible) {
    DOM.pubQ.textContent = q.text;
    if (q.img) { DOM.pubImg.src = q.img; DOM.pubImg.style.display = 'block'; }
    else        { DOM.pubImg.style.display = 'none'; }
  } else {
    DOM.pubQ.textContent      = started ? 'Preparando siguiente pregunta...' : 'Esperando al moderador...';
    DOM.pubImg.style.display  = 'none';
  }

  DOM.pubTnum.textContent = (!timerRunning && timerLeft === timerDuration) ? '—' : timerLeft;
  DOM.pubTnum.className   = `pub-timer${timerState ? ' pub-timer--' + timerState : ''}`;
  DOM.pubBfill.style.width = `${pct}%`;
  DOM.pubBfill.className   = `pub-bar__fill${timerState ? ' pub-bar__fill--' + timerState : ''}`;

  if (buzzedTeam) {
    const team = teams.find(t => t.name === buzzedTeam);
    DOM.pubBuzzed.textContent   = '🎯 ' + buzzedTeam;
    DOM.pubBuzzed.style.display = 'block';
    if (team) {
      DOM.pubBuzzed.style.background  = team.color + '33';
      DOM.pubBuzzed.style.borderColor = team.color;
    }
  } else {
    DOM.pubBuzzed.style.display = 'none';
  }

  const sorted = [...teams].sort((a, b) => (scores[b.name] || 0) - (scores[a.name] || 0));
  DOM.pubScores.innerHTML = sorted.map(t => `
    <div class="pub-score-item">
      <div class="pub-score-dot" style="background:${t.color}"></div>
      <span class="pub-score-name">${escHtml(t.name)}</span>
      <span class="pub-score-pts">${scores[t.name] || 0}</span>
    </div>`).join('');
}

/**
 * Muestra el ranking final animado en la pantalla de audiencia.
 * Se activa cuando el moderador finaliza la partida (gameOver=true en Firebase).
 */
function renderAudienceResults(teams, scores) {
  const sorted = [...teams].sort((a, b) => (scores[b.name] || 0) - (scores[a.name] || 0));
  const medals = ['🥇', '🥈', '🥉'];

  // Reemplazar todo el contenido de la pantalla pública
  const pub = document.getElementById('screen-public');
  pub.innerHTML = `
    <div class="pub-results">
      <div class="pub-results__title">¡Resultados finales!</div>
      <div class="pub-results__subtitle">Trivia OAJNU</div>
      <div class="pub-results__list" id="pub-results-list"></div>
    </div>`;

  // Animar cada posición con delay escalonado
  const list = document.getElementById('pub-results-list');
  sorted.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'pub-results__item';
    item.style.animationDelay = `${i * 0.15}s`;
    item.innerHTML = `
      <span class="pub-results__medal">${medals[i] || i + 1}</span>
      <div class="pub-results__dot" style="background:${t.color}"></div>
      <span class="pub-results__name">${escHtml(t.name)}</span>
      <span class="pub-results__pts">${scores[t.name] || 0} pts</span>`;
    list.appendChild(item);
  });
}