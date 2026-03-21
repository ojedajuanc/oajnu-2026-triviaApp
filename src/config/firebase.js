import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { FB_PATH } from './constants.js';

/**
 * Configuración Firebase.
 *
 * La apiKey es un identificador público por diseño de Firebase — no es un secreto.
 * La seguridad real está en las Realtime Database Rules del proyecto.
 * Referencia: https://firebase.google.com/docs/projects/api-keys
 *
 * Para restringir el uso de la key a tu dominio:
 * Google Cloud Console → APIs & Services → Credentials → Browser key → HTTP referrers
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

export const gameRef = ref(db, FB_PATH);

/**
 * Escribe el estado público del juego a Firebase.
 * Solo el moderador llama a esta función.
 * @param {object} payload
 */
export function writeGameState(payload) {
  return set(gameRef, payload).catch(err => {
    console.error('[Firebase] Error al escribir estado:', err);
  });
}

/**
 * Suscribe un listener al estado del juego en Firebase.
 * Retorna la función de unsubscribe para limpiar en desmontaje.
 * @param {(data: object) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeToGameState(callback) {
  return onValue(gameRef, snapshot => {
    const data = snapshot.val();
    if (data) callback(data);
  });
}
