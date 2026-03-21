import { DIFF } from '../config/constants.js';

/**
 * Módulo de importación de preguntas.
 * Parsea CSV y JSON a un formato interno normalizado.
 * Sin efectos secundarios — todas las funciones son puras.
 */

/**
 * @typedef {object} Question
 * @property {string} text
 * @property {string} ans
 * @property {string} explain
 * @property {string} cat
 * @property {'easy'|'mid'|'hard'} diff
 * @property {number} pts
 * @property {string|null} img
 */

/**
 * Parsea un archivo JSON a un array de preguntas normalizadas.
 * @param {string} text
 * @returns {Question[]}
 */
export function parseJsonFile(text) {
  const data = JSON.parse(text);
  const arr  = Array.isArray(data) ? data : (data.preguntas || data.questions || []);
  return arr.map(normalizeQuestion).filter(q => q.text);
}

/**
 * Parsea un archivo CSV a un array de preguntas normalizadas.
 * Detecta automáticamente si la primera línea es encabezado.
 * Soporta campos con comillas y comas dentro de valores.
 * @param {string} text
 * @returns {Question[]}
 */
export function parseCsvFile(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];

  const firstLow  = lines[0].toLowerCase();
  const hasHeader = ['pregunta', 'question', 'texto'].some(k => firstLow.includes(k));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .map(line => {
      const [
        pregunta   = '',
        respuesta  = '',
        explicacion = '',
        categoria  = '',
        dificultad = 'mid',
        puntos     = '',
      ] = splitCsvLine(line);
      return normalizeQuestion({ pregunta, respuesta, explicacion, categoria, dificultad, puntos });
    })
    .filter(q => q.text);
}

/**
 * Normaliza un objeto raw (de cualquier formato) al formato interno de Question.
 * Acepta nombres de campo en español e inglés.
 * @param {object} raw
 * @returns {Question}
 */
export function normalizeQuestion(raw) {
  const text    = (raw.pregunta || raw.question || raw.texto  || raw.text    || '').trim();
  const ans     = (raw.respuesta || raw.answer  || raw.ans                   || '').trim();
  const explain = (raw.explicacion || raw.explanation || raw.explain         || '').trim();
  const cat     = (raw.categoria || raw.category || raw.cat                  || '').trim();

  const rawDiff = (raw.dificultad || raw.difficulty || raw.diff || 'mid')
    .toString().toLowerCase().trim();

  const diff = ['fácil', 'facil', 'easy'].includes(rawDiff) ? 'easy'
             : ['difícil', 'dificil', 'hard'].includes(rawDiff) ? 'hard'
             : 'mid';

  const rawPts = parseInt(raw.puntos || raw.points || raw.pts || '');
  const pts    = isNaN(rawPts) ? DIFF[diff].pts : rawPts;

  return { text, ans, explain, cat, diff, pts, img: null };
}

/**
 * Divide una línea CSV en columnas respetando campos entre comillas.
 * @param {string} line
 * @returns {string[]}
 */
export function splitCsvLine(line) {
  const cols = [];
  let cur = '';
  let inQuotes = false;

  for (const ch of line) {
    if (ch === '"')               { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { cols.push(cur.trim()); cur = ''; }
    else                          { cur += ch; }
  }
  cols.push(cur.trim());
  return cols;
}
