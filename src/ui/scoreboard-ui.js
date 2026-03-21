import { DOM } from './dom.js';
import { escHtml, escAttr } from '../utils.js';

/**
 * Renderiza el marcador lateral ordenado por puntos.
 * @param {Array<{name: string, color: string}>} teams
 * @param {Record<string, number>} scores
 */
export function renderScoreboard(teams, scores) {
  const sorted = [...teams].sort((a, b) => (scores[b.name] || 0) - (scores[a.name] || 0));
  DOM.scoreList.innerHTML = sorted.map((t, i) => `
    <div class="score-item ${i === 0 ? 'score-item--first' : ''}" data-team="${escAttr(t.name)}">
      <div class="score-item__rank ${i === 0 ? 'score-item__rank--star' : ''}">
        ${i === 0 ? '★' : i + 1}
      </div>
      <div class="team-dot" style="background:${t.color}"></div>
      <div class="score-item__name">${escHtml(t.name)}</div>
      <div class="score-item__pts">${scores[t.name] || 0}</div>
      <div class="score-item__delta"></div>
    </div>`).join('');
}

/**
 * Muestra animación de +/- puntos en el equipo correspondiente.
 * @param {string} teamName
 * @param {number} delta
 */
export function showScoreDelta(teamName, delta) {
  DOM.scoreList.querySelectorAll('[data-team]').forEach(el => {
    if (el.dataset.team !== teamName) return;
    const d = el.querySelector('.score-item__delta');
    d.textContent = (delta > 0 ? '+' : '') + delta;
    d.className   = `score-item__delta show ${delta > 0 ? 'score-item__delta--plus' : 'score-item__delta--minus'}`;
    setTimeout(() => d.classList.remove('show'), 2200);
  });
}
