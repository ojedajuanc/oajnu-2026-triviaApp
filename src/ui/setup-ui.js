import { DOM } from './dom.js';
import { SEDES, DIFF } from '../config/constants.js';
import { escHtml, escAttr } from '../utils.js';
import * as setup from '../state/setup.js';

/** Renderiza la grilla de checkboxes de sedes */
export function renderSedes() {
  document.getElementById('sedes-wrap').innerHTML = SEDES.map(s => `
    <label class="sedes-label">
      <input type="checkbox" value="${escAttr(s)}"
        style="width:auto;accent-color:var(--c-naranja)"
        onchange="updateSetupSummary()" />
      ${escHtml(s)}
    </label>`).join('');
}

/** Renderiza la lista de equipos configurados */
export function renderTeamList() {
  DOM.teamList.innerHTML = setup.teams.map((t, i) => `
    <div class="list-item">
      <div class="team-dot" style="background:${t.color}"></div>
      <span>${escHtml(t.name)}</span>
      <button onclick="removeTeam(${i})" aria-label="Eliminar">×</button>
    </div>`).join('')
    || '<p class="empty-msg">Sin equipos agregados.</p>';
}

/** Renderiza la lista de categorías */
export function renderCatList() {
  if (!setup.cats.length) {
    DOM.catList.innerHTML      = '';
    DOM.catEmpty.style.display = 'block';
    return;
  }
  DOM.catEmpty.style.display = 'none';
  DOM.catList.innerHTML = setup.cats.map((c, i) => `
    <div class="list-item">
      <span class="badge badge--cat">${escHtml(c)}</span>
      <span style="flex:1;margin-left:8px">${escHtml(c)}</span>
      <button onclick="removeCat(${i})" aria-label="Eliminar">×</button>
    </div>`).join('');
}

/** Sincroniza el <select> de categorías con el estado actual */
export function syncCatSelect() {
  DOM.catSelect.innerHTML =
    '<option value="">Sin categoría</option>' +
    setup.cats.map(c => `<option value="${escAttr(c)}">${escHtml(c)}</option>`).join('');
}

/** Renderiza la lista de preguntas cargadas */
export function renderQuestionList() {
  if (!setup.questions.length) {
    DOM.qList.innerHTML        = '';
    DOM.qEmpty.style.display   = 'block';
    DOM.qCount.textContent     = '';
    return;
  }
  DOM.qEmpty.style.display = 'none';
  const n = setup.questions.length;
  DOM.qCount.textContent = `${n} pregunta${n !== 1 ? 's' : ''} cargada${n !== 1 ? 's' : ''}`;
  DOM.qList.innerHTML = setup.questions.map((q, i) => `
    <div class="q-item">
      <div class="q-item__meta">
        <span class="q-item__num">P${i + 1}</span>
        <span class="badge ${DIFF[q.diff]?.cssClass || 'badge--mid'}">${DIFF[q.diff]?.label || q.diff}</span>
        ${q.cat ? `<span class="badge badge--cat">${escHtml(q.cat)}</span>` : ''}
        <span class="badge badge--pts">${q.pts} pts</span>
      </div>
      <div class="q-item__text">${escHtml(q.text)}</div>
      ${q.ans     ? `<div class="q-item__ans">✓ ${escHtml(q.ans)}</div>`     : ''}
      ${q.explain ? `<div class="q-item__exp">${escHtml(q.explain)}</div>`   : ''}
      ${q.img     ? `<img class="q-item__img" src="${q.img}" alt="" />`      : ''}
      <button class="q-item__delete" onclick="removeQuestion(${i})" aria-label="Eliminar">×</button>
    </div>`).join('');
}

/** Actualiza el resumen de equipos y preguntas en el footer del setup */
export function updateSetupSummary() {
  const teamCount = setup.mode === 'sedes'
    ? document.querySelectorAll('#sedes-wrap input:checked').length
    : setup.teams.length;
  const qCount = setup.questions.length;
  DOM.setupSummary.textContent =
    `${teamCount} equipo${teamCount !== 1 ? 's' : ''} · ${qCount} pregunta${qCount !== 1 ? 's' : ''}`;
}

/** Muestra u oculta el mensaje de resultado de importación */
export function showImportMsg(msg, isError) {
  const el = document.getElementById('import-msg');
  el.textContent = msg;
  el.className   = `import-msg ${isError ? 'import-msg--error' : 'import-msg--ok'}`;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 6000);
}

