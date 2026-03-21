/**
 * main.js — Entry point de la aplicación.
 *
 * Responsabilidades:
 *  1. Importar estilos (Vite los procesa y hace tree-shaking)
 *  2. Detectar rol (moderador vs. audiencia) y bifurcar inicialización
 *  3. Exponer al HTML las funciones que los onclick necesitan (window.*)
 *  4. Cablear los módulos entre sí (estado ↔ UI ↔ Firebase ↔ timer)
 *
 * Nota sobre window.*: en una app con framework (React, Vue) esto no sería
 * necesario. En Vanilla JS + HTML con onclick inline, es la forma más simple
 * de exponer funciones sin añadir complejidad innecesaria.
 */

// ── Estilos ────────────────────────────────────────────
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/setup.css';
import './styles/game.css';
import './styles/public.css';
import './styles/final.css';

// ── Firebase ───────────────────────────────────────────
import { writeGameState, subscribeToGameState } from './config/firebase.js';

// ── Constantes ─────────────────────────────────────────
import { SEDES, TEAM_COLORS, DIFF, MAX_TEAMS } from './config/constants.js';

// ── Estado ─────────────────────────────────────────────
import * as setupState from './state/setup.js';
import * as gameState  from './state/game.js';

// ── Módulos ────────────────────────────────────────────
import {
  configureTimer, getTimerState,
  startTimer, resumeTimer, pauseTimer, stopTimer, resetTimer,
} from './modules/timer.js';
import { playSound }                             from './modules/audio.js';
import { parseJsonFile, parseCsvFile }           from './modules/importer.js';
import { exportResults, downloadTemplate as dlTemplate } from './modules/exporter.js';

// ── UI ─────────────────────────────────────────────────
import { DOM }                                    from './ui/dom.js';
import { showScreen, switchTab, switchFinalTab, openModal, closeModal } from './ui/screens.js';
import {
  renderSedes, renderTeamList, renderCatList,
  syncCatSelect, renderQuestionList, updateSetupSummary, showImportMsg,
} from './ui/setup-ui.js';
import {
  renderBuzzerGrid, renderQuestion, revealAnswer as uiRevealAnswer,
  updateTimerDisplay, setTimerButtonState, setTimerStatusText,
  showBuzzed, clearBuzzed, resetGameUI, updateJokerUI,
} from './ui/game-ui.js';
import { renderScoreboard, showScoreDelta }       from './ui/scoreboard-ui.js';
import { buildFinalScreens }                      from './ui/final-ui.js';
import { renderAudienceView }                     from './ui/public-ui.js';

/* ════════════════════════════════════════════════════════
   DETECCIÓN DE ROL
   IS_AUDIENCE es inmutable — se determina una vez al cargar.
   El script inline en <head> ya aplicó la clase CSS para
   evitar flash, aquí completamos la inicialización JS.
════════════════════════════════════════════════════════ */
const IS_AUDIENCE = location.hash.includes('audience');

/* ════════════════════════════════════════════════════════
   FIREBASE — publicar / suscribir
════════════════════════════════════════════════════════ */

/** Serializa y escribe el estado público a Firebase. */
function publish() {
  writeGameState(gameState.toFirebasePayload(getTimerState()));
}

// La audiencia se suscribe en tiempo real; el moderador no necesita suscribirse.
if (IS_AUDIENCE) {
  subscribeToGameState(renderAudienceView);
}

/* ════════════════════════════════════════════════════════
   TIMER — configurar callbacks
════════════════════════════════════════════════════════ */
configureTimer({
  onTick: () => {
    const { left } = getTimerState();
    updateTimerDisplay(left, setupState.timerDuration);
    publish(); // sincroniza el countdown a la pantalla pública cada segundo
  },
  onTimeout: () => {
    setTimerStatusText('¡Tiempo!');
    updateTimerDisplay(0, setupState.timerDuration);
    playSound('timeout');
    publish();
  },
});

/* ════════════════════════════════════════════════════════
   SETUP
════════════════════════════════════════════════════════ */

// Tabs — event delegation en lugar de onclick inline
document.querySelectorAll('.tab[data-tab]').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

window.selectMode = (mode) => {
  setupState.setMode(mode);
  document.getElementById('mc-grupos').classList.toggle('selected', mode === 'grupos');
  document.getElementById('mc-sedes').classList.toggle('selected',  mode === 'sedes');
  document.getElementById('cfg-grupos').style.display = mode === 'grupos' ? 'block' : 'none';
  document.getElementById('cfg-sedes').style.display  = mode === 'sedes'  ? 'block' : 'none';
  updateSetupSummary();
};

window.addTeam = () => {
  const input = document.getElementById('inp-team');
  const name  = input.value.trim();
  if (!name) return;
  if (setupState.teams.length >= MAX_TEAMS) { alert(`Máximo ${MAX_TEAMS} equipos.`); return; }
  if (setupState.teams.some(t => t.name === name)) { alert('Nombre duplicado.'); return; }
  setupState.addTeam({ name, color: TEAM_COLORS[setupState.teams.length % TEAM_COLORS.length] });
  input.value = '';
  renderTeamList();
  updateSetupSummary();
};

window.removeTeam = (index) => {
  setupState.removeTeam(index);
  renderTeamList();
  updateSetupSummary();
};

window.addCat = () => {
  const input = document.getElementById('inp-cat-new');
  const name  = input.value.trim();
  if (!name || setupState.cats.includes(name)) return;
  setupState.addCat(name);
  input.value = '';
  renderCatList();
  syncCatSelect();
};

window.removeCat = (index) => {
  setupState.removeCat(index);
  renderCatList();
  syncCatSelect();
};

window.updateSetupSummary = updateSetupSummary;

window.previewImg = (input) => {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    setupState.setPendingImg(e.target.result);
    const prev = document.getElementById('img-preview');
    prev.src           = e.target.result;
    prev.style.display = 'block';
  };
  reader.readAsDataURL(file);
};

window.addQuestion = () => {
  const text = document.getElementById('inp-q').value.trim();
  if (!text) return;

  const diff     = document.getElementById('inp-diff').value;
  const customPts = parseInt(document.getElementById('inp-pts').value);
  const pts      = isNaN(customPts) ? DIFF[diff].pts : customPts;
  const cat      = document.getElementById('inp-cat').value;

  // Asegurar que la categoría exista en el estado
  if (cat && !setupState.cats.includes(cat)) {
    setupState.addCat(cat);
    syncCatSelect();
    renderCatList();
  }

  setupState.addQuestion({
    text,
    ans:     document.getElementById('inp-ans').value.trim(),
    explain: document.getElementById('inp-explain').value.trim(),
    diff, pts, cat,
    img: setupState.pendingImg,
  });
  setupState.clearPendingImg();

  ['inp-q','inp-ans','inp-explain','inp-pts'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('inp-img').value   = '';
  document.getElementById('img-preview').style.display = 'none';

  renderQuestionList();
  updateSetupSummary();
};

window.removeQuestion = (index) => {
  setupState.removeQuestion(index);
  renderQuestionList();
  updateSetupSummary();
};

/* ── Import ── */
window.onDragOver  = (e) => { e.preventDefault(); document.getElementById('drop-zone').classList.add('import-zone--dragover'); };
window.onDragLeave = ()  => { document.getElementById('drop-zone').classList.remove('import-zone--dragover'); };
window.onDrop      = (e) => { e.preventDefault(); window.onDragLeave(); processFile(e.dataTransfer.files[0]); };
window.onFileSelect = (input) => { if (input.files[0]) processFile(input.files[0]); };

function processFile(file) {
  if (!file) return;
  const ext    = file.name.split('.').pop().toLowerCase();
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = ext === 'json' ? parseJsonFile(e.target.result)
                     : ext === 'csv'  ? parseCsvFile(e.target.result)
                     : null;
      if (!imported)          { showImportMsg('Formato no soportado. Usá CSV o JSON.', true); return; }
      if (!imported.length)   { showImportMsg('No se encontraron preguntas válidas.', true); return; }

      imported.forEach(q => {
        if (q.cat && !setupState.cats.includes(q.cat)) {
          setupState.addCat(q.cat);
          syncCatSelect();
          renderCatList();
        }
        setupState.addQuestion(q);
      });

      renderQuestionList();
      updateSetupSummary();
      showImportMsg(`✓ ${imported.length} pregunta${imported.length !== 1 ? 's' : ''} importada${imported.length !== 1 ? 's' : ''} desde "${file.name}".`, false);
      switchTab('t-questions');
    } catch (err) {
      showImportMsg('Error al procesar el archivo: ' + err.message, true);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

window.downloadTemplate = (fmt) => dlTemplate(fmt);

/* ════════════════════════════════════════════════════════
   GAME START
════════════════════════════════════════════════════════ */
window.startGame = () => {
  if (setupState.mode === 'sedes') {
    const checked = [...document.querySelectorAll('#sedes-wrap input:checked')];
    if (checked.length < 2) { alert('Seleccioná al menos 2 sedes.'); return; }
    setupState.setTeams(
      checked.map((el, i) => ({ name: el.value, color: TEAM_COLORS[i % TEAM_COLORS.length] }))
    );
  } else {
    if (setupState.teams.length < 2) { alert('Agregá al menos 2 equipos.'); return; }
  }
  if (!setupState.questions.length) { alert('Agregá o importá al menos una pregunta.'); return; }

  setupState.setTimerDuration(parseInt(document.getElementById('inp-timer').value));
  setupState.setJokersPerTeam(parseInt(document.getElementById('inp-jokers').value));

  gameState.initGame(setupState);

  showScreen('screen-game');
  DOM.gQtotal.textContent = `de ${setupState.questions.length} preguntas`;

  renderScoreboard(gameState.teams, gameState.scores);
  advanceQuestion();
};

/* ════════════════════════════════════════════════════════
   GAME LOGIC
════════════════════════════════════════════════════════ */
function advanceQuestion() {
  stopTimer();
  resetTimer(setupState.timerDuration);
  setTimerButtonState('idle');
  resetGameUI();

  gameState.setCurrentQ(gameState.currentQ + 1);
  gameState.setBuzzedTeam(null);
  gameState.setJudged(false);
  gameState.setStarted(true);

  if (gameState.currentQ >= setupState.questions.length) {
    endGame();
    return;
  }

  const q = setupState.questions[gameState.currentQ];
  renderQuestion(q, gameState.currentQ, setupState.questions.length);
  renderBuzzerGrid(gameState.teams, buzzHandler);
  updateTimerDisplay(setupState.timerDuration, setupState.timerDuration);
  playSound('next');
  publish();
}

// Alias público para el botón HTML
window.nextQuestion = advanceQuestion;

function buzzHandler(teamName) {
  if (gameState.buzzedTeam || gameState._judged) return;
  gameState.setBuzzedTeam(teamName);
  pauseTimer();
  setTimerButtonState('paused');

  const team = gameState.teams.find(t => t.name === teamName);
  const pts  = setupState.questions[gameState.currentQ]?.pts ?? 10;
  showBuzzed(teamName, team, pts);

  if (setupState.jokersPerTeam > 0) {
    updateJokerUI(gameState._jokers[teamName] ?? 0);
  }

  playSound('buzz');
  publish();
}

window.judge = (isCorrect) => {
  if (gameState._judged || !gameState.buzzedTeam) return;
  gameState.setJudged(true);

  const teamName = gameState.buzzedTeam;
  const q        = setupState.questions[gameState.currentQ];
  const delta    = gameState.calcDelta(isCorrect, q.pts);

  gameState.applyScore(teamName, delta);
  gameState.recordJudgment({ teamName, questionIndex: gameState.currentQ, isCorrect, delta, cat: q.cat });

  showScoreDelta(teamName, delta);
  renderScoreboard(gameState.teams, gameState.scores);
  playSound(isCorrect ? 'correct' : 'wrong');

  clearBuzzed();
  gameState.setBuzzedTeam(null);

  if (isCorrect) {
    uiRevealAnswer(!!q.explain);
    stopTimer();
    setTimerButtonState('idle');
  } else {
    gameState.setJudged(false);
    resumeTimer();
    setTimerButtonState('running');
  }
  publish();
};

window.revealAnswer = () => {
  const q = setupState.questions[gameState.currentQ];
  uiRevealAnswer(!!q?.explain);
};

window.useJoker = () => {
  const name = gameState.buzzedTeam;
  if (!name || (gameState._jokers[name] ?? 0) <= 0) return;
  gameState.consumeJoker(name);
  updateJokerUI(gameState._jokers[name]);
  document.getElementById('joker-msg').textContent =
    `${name} usa un comodín. Puede consultar con su grupo durante 30 segundos. El timer permanece pausado.`;
  openModal('modal-joker');
};

/* ── Timer controls ── */
window.toggleTimer = () => {
  const { running, left } = getTimerState();
  if (running) {
    pauseTimer();
    setTimerButtonState('paused');
  } else if (left === setupState.timerDuration) {
    startTimer(setupState.timerDuration);
    setTimerButtonState('running');
  } else {
    resumeTimer();
    setTimerButtonState('running');
  }
};

/* ── Pantalla pública ── */
document.getElementById('btn-open-public')?.addEventListener('click', () => {
  const base = location.href.split('?')[0].split('#')[0];
  window.open(base + '#audience', 'trivia-publico', 'width=1280,height=720');
});

/* ════════════════════════════════════════════════════════
   FINAL
════════════════════════════════════════════════════════ */
document.querySelectorAll('.final-tab[data-final-tab]').forEach(tab => {
  tab.addEventListener('click', () => switchFinalTab(tab.dataset.finalTab));
});

window.viewScoreboard = () => {
  buildFinalScreens(gameState);
  showScreen('screen-final');
  DOM.btnExport.style.display = 'none';
  if (!document.getElementById('btn-back-game')) {
    const btn    = document.createElement('button');
    btn.id       = 'btn-back-game';
    btn.className = 'btn btn--outline';
    btn.textContent = '← Volver al juego';
    btn.onclick  = () => showScreen('screen-game');
    DOM.finalActions.prepend(btn);
  }
};

window.endGame = () => {
  closeModal('modal-end');
  stopTimer();
  buildFinalScreens(gameState);
  showScreen('screen-final');
  DOM.btnExport.style.display = 'inline-flex';
  document.getElementById('btn-back-game')?.remove();
};

window.exportResults = () => exportResults({
  teams:      gameState.teams,
  questions:  setupState.questions,
  cats:       setupState.cats,
  scores:     gameState.scores,
  _correct:   gameState._correct,
  _wrong:     gameState._wrong,
  _catScores: gameState._catScores,
});

window.openModal  = openModal;
window.closeModal = closeModal;

window.resetGame = () => {
  stopTimer();
  setupState.resetSetup();

  renderTeamList();
  renderQuestionList();
  renderCatList();
  syncCatSelect();
  updateSetupSummary();

  document.getElementById('inp-timer').value  = '30';
  document.getElementById('inp-timer-val').textContent  = '30';
  document.getElementById('inp-jokers').value = '1';
  document.getElementById('inp-jokers-val').textContent = '1';

  DOM.btnExport.style.display = 'none';
  document.getElementById('btn-back-game')?.remove();

  showScreen('screen-setup');
  switchTab('t-mode');
  window.selectMode('grupos');
};

/* ════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════ */
(function init() {
  renderSedes();
  renderTeamList();
  renderQuestionList();
  renderCatList();
  syncCatSelect();
  updateSetupSummary();

  if (IS_AUDIENCE) {
    document.title          = 'Trivia OAJNU · Pantalla Pública';
    DOM.pubQ.textContent    = 'Esperando al moderador...';
    DOM.pubTnum.textContent = '—';
  }
})();
