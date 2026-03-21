/**
 * Navegación entre pantallas y tabs.
 */

const SETUP_TABS     = ['t-mode', 't-import', 't-questions', 't-cats'];
const FINAL_TABS     = ['ft-podium', 'ft-stats', 'ft-cats'];

/** Activa una pantalla y desactiva todas las demás */
export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/** Cambia la pestaña activa en el setup */
export function switchTab(targetId) {
  SETUP_TABS.forEach(id => {
    document.getElementById(id).style.display = id === targetId ? 'block' : 'none';
  });
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === targetId);
  });
}

/** Cambia la pestaña activa en la pantalla final */
export function switchFinalTab(targetId) {
  FINAL_TABS.forEach(id => {
    document.getElementById(id).style.display = id === targetId ? 'block' : 'none';
  });
  document.querySelectorAll('.final-tab[data-final-tab]').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.finalTab === targetId);
  });
}

export function openModal(id)  { document.getElementById(id).classList.add('active'); }
export function closeModal(id) { document.getElementById(id).classList.remove('active'); }
