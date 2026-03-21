/**
 * Cache del DOM.
 * Centralizar los getElementById evita buscarlo en cada render.
 * Se inicializa una sola vez al cargar la app.
 */

const $ = id => document.getElementById(id);

export const DOM = {
  // Setup
  teamList:     $('team-list'),
  qList:        $('q-list'),
  qEmpty:       $('q-empty'),
  qCount:       $('q-count'),
  catList:      $('cat-list'),
  catEmpty:     $('cat-empty'),
  catSelect:    $('inp-cat'),
  setupSummary: $('setup-summary'),

  // Game
  gQnum:        $('g-qnum'),
  gQtotal:      $('g-qtotal'),
  qMetaBar:     $('q-meta-bar'),
  qMain:        $('q-main'),
  qImg:         $('q-img'),
  qAns:         $('q-ans'),
  qExplain:     $('q-explain'),
  buzzedBox:    $('buzzed-box'),
  buzzedName:   $('buzzed-name'),
  judgeBtns:    $('judge-btns'),
  ptsLbl:       $('pts-lbl'),
  btnTimer:     $('btn-timer'),
  timerStatus:  $('timer-status'),
  tFill:        $('t-fill'),
  tNum:         $('t-num'),
  comodinArea:  $('comodin-area'),
  jokerCount:   $('joker-count'),
  buzzerGrid:   $('buzzer-grid'),
  scoreList:    $('score-list'),

  // Public
  pubQnum:      $('pub-qnum'),
  pubMeta:      $('pub-meta'),
  pubQ:         $('pub-q'),
  pubImg:       $('pub-img'),
  pubTnum:      $('pub-tnum'),
  pubBfill:     $('pub-bfill'),
  pubScores:    $('pub-scores'),
  pubBuzzed:    $('pub-buzzed'),

  // Final
  btnExport:    $('btn-export'),
  finalActions: $('final-actions'),
  ftPodium:     $('ft-podium'),
  ftStats:      $('ft-stats'),
  ftCats:       $('ft-cats'),
};
