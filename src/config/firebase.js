import { initializeApp } from 'firebase/app';
import {
  getDatabase, ref, set, update, onValue, push, serverTimestamp, remove,
} from 'firebase/database';

/**
 * Configuración Firebase.
 * La apiKey es un identificador público por diseño — no es un secreto.
 * La seguridad real está en Realtime Database Rules.
 * Referencia: https://firebase.google.com/docs/projects/api-keys
 */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBrEkdO1zUNzarBPjXLNYC8Iw5YXuehyKg",
  authDomain: "trivaapp-oajnu.firebaseapp.com",
  databaseURL: "https://trivaapp-oajnu-default-rtdb.firebaseio.com",
  projectId: "trivaapp-oajnu",
  storageBucket: "trivaapp-oajnu.firebasestorage.app",
  messagingSenderId: "556848845323",
  appId: "1:556848845323:web:a80fd25762680cdcdb6d0e",
  measurementId: "G-LRVBY5M089"
};

const app = initializeApp(FIREBASE_CONFIG);
const db  = getDatabase(app);

/* ════════════════════════════════════════════════════════
   SALA — cada partida vive en su propio nodo
   trivia/salas/{codigo}/estado
   trivia/salas/{codigo}/buzz        ← primero en llegar
   trivia/salas/{codigo}/resultados  ← snapshot final
════════════════════════════════════════════════════════ */

/** Código de sala activo (4 letras mayúsculas). Null hasta que se crea/une. */
let _salaCode = null;

/** Refs dinámicas — se inicializan al conocer el código de sala. */
let _estadoRef    = null;
let _buzzRef      = null;
let _resultadosRef = null;

/** Retorna el código de sala actual. */
export function getSalaCode() { return _salaCode; }

/**
 * Genera un código de sala de 4 letras y crea el nodo en Firebase.
 * Lo llama el moderador al iniciar el juego.
 * @returns {string} código generado
 */
export function createSala() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I/O para evitar confusión visual
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  _setSalaCode(code);
  return code;
}

/**
 * Apunta a una sala existente por código.
 * Lo usan la audiencia y los participantes al entrar.
 * @param {string} code
 */
export function joinSala(code) {
  _setSalaCode(code.toUpperCase());
}

function _setSalaCode(code) {
  _salaCode       = code;
  const base      = `trivia/salas/${code}`;
  _estadoRef      = ref(db, `${base}/estado`);
  _buzzRef        = ref(db, `${base}/buzz`);
  _resultadosRef  = ref(db, `${base}/resultados`);
}

/* ════════════════════════════════════════════════════════
   ESTADO DEL JUEGO (moderador escribe, audiencia lee)
════════════════════════════════════════════════════════ */

/** Escribe el estado público completo. Solo el moderador. */
export function writeGameState(payload) {
  if (!_estadoRef) return Promise.resolve();
  return set(_estadoRef, payload).catch(err => {
    console.error('[Firebase] writeGameState error:', err);
  });
}

/**
 * Suscribe un listener al estado del juego.
 * @param {(data: object) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToGameState(callback) {
  if (!_estadoRef) return () => {};
  return onValue(_estadoRef, snap => {
    const data = snap.val();
    if (data) callback(data);
  });
}

/* ════════════════════════════════════════════════════════
   BUZZ — participantes (modo buzz desde celular)
   Estructura: trivia/salas/{codigo}/buzz/{pushId}
     { team, ts: serverTimestamp() }
   El moderador lee quién llegó primero por timestamp.
════════════════════════════════════════════════════════ */

/**
 * Registra un buzz de un participante con timestamp del servidor.
 * @param {string} teamName
 */
export function sendBuzz(teamName) {
  if (!_buzzRef) return;
  push(_buzzRef, { team: teamName, ts: serverTimestamp() }).catch(err => {
    console.error('[Firebase] sendBuzz error:', err);
  });
}

/**
 * Suscribe al canal de buzz. Llama callback con el primer buzz recibido.
 * Ignora buzzes posteriores hasta que se limpie el canal.
 * @param {(teamName: string) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToFirstBuzz(callback) {
  if (!_buzzRef) return () => {};
  let fired = false;
  return onValue(_buzzRef, snap => {
    if (!snap.exists() || fired) return;
    // Ordenar por ts y tomar el primero
    const entries = [];
    snap.forEach(child => entries.push({ ...child.val(), key: child.key }));
    entries.sort((a, b) => (a.ts || 0) - (b.ts || 0));
    if (entries.length) {
      fired = true;
      callback(entries[0].team);
    }
  });
}

/** Limpia todos los buzzes (moderador llama al avanzar pregunta). */
export function clearBuzzChannel() {
  if (!_buzzRef) return;
  remove(_buzzRef).catch(err => console.error('[Firebase] clearBuzzChannel error:', err));
}

/* ════════════════════════════════════════════════════════
   RESULTADOS — snapshot final (dashboard post-sesión)
════════════════════════════════════════════════════════ */

/**
 * Guarda el snapshot final de la partida.
 * @param {object} results
 */
export function writeResults(results) {
  if (!_resultadosRef) return Promise.resolve();
  return set(_resultadosRef, { ...results, savedAt: serverTimestamp() }).catch(err => {
    console.error('[Firebase] writeResults error:', err);
  });
}

/**
 * Lee los resultados de una sala (para el dashboard).
 * @param {string} code
 * @param {(data: object) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToResults(code, callback) {
  const r = ref(db, `trivia/salas/${code}/resultados`);
  return onValue(r, snap => {
    const data = snap.val();
    if (data) callback(data);
  });
}