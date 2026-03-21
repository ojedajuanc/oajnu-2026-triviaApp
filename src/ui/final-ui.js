import { DOM } from './dom.js';
import { DIFF } from '../config/constants.js';
import { escHtml } from '../utils.js';

/**
 * Construye las tres pestañas de la pantalla final.
 * @param {{ teams, questions, cats, scores, _correct, _wrong, _catScores, _history }} gameState
 */
export function buildFinalScreens(gameState) {
  const sorted = [...gameState.teams].sort(
    (a, b) => (gameState.scores[b.name] || 0) - (gameState.scores[a.name] || 0)
  );
  buildPodium(sorted, gameState);
  buildStats(sorted, gameState);
  buildCategoryStats(sorted, gameState);
}

function buildPodium(sorted, { questions, scores }) {
  const top     = sorted.slice(0, 3);
  const order   = top.length >= 2 ? [top[1], top[0], top[2]].filter(Boolean) : [top[0]];
  const emojis  = top.length >= 2 ? ['🥈', '🥇', '🥉'] : ['🥇'];
  const heights = top.length >= 2 ? [110, 150, 80] : [150];

  DOM.ftPodium.innerHTML = `
    <div class="podium-wrap">
      <div class="podium-title">¡Resultados!</div>
      <div class="podium-subtitle">${questions.length} preguntas · Trivia OAJNU</div>
      <div class="podium-bars">
        ${order.map((t, i) => `
          <div class="podium-bar">
            <div class="podium-bar__block" style="height:${heights[i]}px;background:${t.color}22;border-color:${t.color}">
              ${emojis[i]}
            </div>
            <div class="podium-bar__name" style="color:${t.color}">${escHtml(t.name)}</div>
            <div class="podium-bar__pts">${scores[t.name] || 0} pts</div>
          </div>`).join('')}
      </div>
      <div class="podium-list">
        ${sorted.map((t, i) => `
          <div class="podium-row">
            <div class="podium-row__rank">${i + 1}</div>
            <div class="podium-row__dot" style="background:${t.color}"></div>
            <div class="podium-row__name">${escHtml(t.name)}</div>
            <div class="podium-row__pts">${scores[t.name] || 0}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function buildStats(sorted, { questions, _history, _correct, _wrong }) {
  const total   = _history.length;
  const correct = _history.filter(h => h.correct).length;
  const pct     = total ? Math.round(correct / total * 100) : 0;
  const mf      = findMostFailed(_history, questions);

  DOM.ftStats.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-card__num">${questions.length}</div>
        <div class="stat-card__lbl">Preguntas totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__num">${pct}%</div>
        <div class="stat-card__lbl">Tasa de aciertos</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__num">${correct}</div>
        <div class="stat-card__lbl">Respuestas correctas</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__num">${total - correct}</div>
        <div class="stat-card__lbl">Respuestas incorrectas</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div class="label" style="margin-bottom:12px">Rendimiento por equipo</div>
      ${sorted.map(t => {
        const c  = _correct[t.name] || 0;
        const w  = _wrong[t.name]   || 0;
        const ep = (c + w) ? Math.round(c / (c + w) * 100) : 0;
        return `
          <div class="team-stat-row">
            <div class="team-stat-row__header">
              <div class="team-dot" style="background:${t.color}"></div>
              <span class="team-stat-row__name">${escHtml(t.name)}</span>
              <span class="team-stat-row__detail">${c} ✓  ${w} ✗  ${ep}%</span>
            </div>
            <div class="team-stat-row__bar-bg">
              <div class="team-stat-row__bar-fill" style="width:${ep}%;background:${t.color}"></div>
            </div>
          </div>`;
      }).join('')}
    </div>

    ${mf ? `
      <div class="card">
        <div class="label" style="margin-bottom:6px">Pregunta más fallada</div>
        <p style="font-size:13px;font-weight:700">${escHtml(mf)}</p>
      </div>` : ''}`;
}

function buildCategoryStats(sorted, { cats, questions, _catScores }) {
  if (!cats.length) {
    DOM.ftCats.innerHTML = '<p class="empty-msg">No se configuraron categorías.</p>';
    return;
  }
  DOM.ftCats.innerHTML = cats.map(cat => {
    const catQs  = questions.filter(q => q.cat === cat);
    const maxPts = catQs.reduce((s, q) => s + q.pts, 0) || 1;
    return `
      <div class="card" style="margin-bottom:10px">
        <div class="label" style="margin-bottom:10px">
          ${escHtml(cat)} · ${catQs.length} pregunta${catQs.length !== 1 ? 's' : ''}
        </div>
        ${sorted.map(t => {
          const pts  = _catScores[t.name]?.[cat] || 0;
          const pct2 = Math.min(100, Math.round(pts / maxPts * 100));
          return `
            <div class="cat-row">
              <div class="team-dot" style="background:${t.color}"></div>
              <span class="cat-row__name">${escHtml(t.name)}</span>
              <div class="cat-row__bar-wrap">
                <div class="cat-row__bar-fill" style="width:${pct2}%;background:${t.color}"></div>
              </div>
              <span class="cat-row__pts">${pts} pts</span>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');
}

function findMostFailed(history, questions) {
  const failCount = {};
  history.filter(h => !h.correct).forEach(h => {
    failCount[h.q] = (failCount[h.q] || 0) + 1;
  });
  const entries = Object.entries(failCount).sort(([, a], [, b]) => b - a);
  if (!entries.length) return null;
  return questions[parseInt(entries[0][0])]?.text ?? null;
}
