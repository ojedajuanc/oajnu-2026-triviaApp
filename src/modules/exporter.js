import { DIFF } from '../config/constants.js';

/**
 * Módulo de exportación.
 * Genera archivos descargables — sin efectos secundarios en el DOM
 * excepto el click programático necesario para disparar la descarga.
 */

/**
 * Exporta los resultados de la partida como archivo .txt.
 * @param {{ teams, questions, cats, scores, _correct, _wrong, _catScores }} data
 */
export function exportResults({ teams, questions, cats, scores, _correct, _wrong, _catScores }) {
  const sorted = [...teams].sort((a, b) => (scores[b.name] || 0) - (scores[a.name] || 0));

  const lines = [
    'TRIVIA OAJNU',
    '='.repeat(40),
    '',
    'RANKING FINAL',
    ...sorted.map((t, i) =>
      `${i + 1}. ${t.name}: ${scores[t.name] || 0} pts  ` +
      `(✓${_correct[t.name] || 0}  ✗${_wrong[t.name] || 0})`
    ),
    '',
    'PREGUNTAS',
    ...questions.flatMap((q, i) => [
      `P${i + 1} [${DIFF[q.diff].label}${q.cat ? ' · ' + q.cat : ''}] ${q.pts} pts`,
      `   Pregunta: ${q.text}`,
      ...(q.ans     ? [`   Respuesta: ${q.ans}`]       : []),
      ...(q.explain ? [`   Explicación: ${q.explain}`] : []),
      '',
    ]),
    ...(cats.length ? [
      'RENDIMIENTO POR CATEGORÍA',
      ...cats.flatMap(cat => [
        '',
        `${cat}:`,
        ...sorted.map(t => `  ${t.name}: ${_catScores[t.name]?.[cat] || 0} pts`),
      ]),
    ] : []),
  ];

  _downloadBlob(lines.join('\n'), 'trivia_oajnu_resultados.txt', 'text/plain;charset=utf-8');
}

/**
 * Genera y descarga una plantilla de ejemplo en el formato indicado.
 * @param {'csv' | 'json'} fmt
 */
export function downloadTemplate(fmt) {
  const sampleQuestions = [
    { pregunta: '¿En qué año fue fundada la ONU?',         respuesta: '1945',  explicacion: 'Fundada el 24 de octubre de 1945.', categoria: 'Historia',      dificultad: 'easy', puntos: 10 },
    { pregunta: '¿Cuántos países miembros tiene la ONU?',  respuesta: '193',   explicacion: '193 estados miembros.',             categoria: 'Institucional', dificultad: 'mid',  puntos: 15 },
    { pregunta: '¿Qué significa ODS?',                     respuesta: 'Objetivos de Desarrollo Sostenible', explicacion: '17 objetivos de la Agenda 2030.', categoria: 'Agenda 2030', dificultad: 'hard', puntos: 20 },
  ];

  if (fmt === 'csv') {
    const rows = [
      'pregunta,respuesta,explicacion,categoria,dificultad,puntos',
      ...sampleQuestions.map(q =>
        [q.pregunta, q.respuesta, q.explicacion, q.categoria, q.dificultad, q.puntos].join(',')
      ),
    ];
    _downloadBlob(rows.join('\n'), 'plantilla_trivia_oajnu.csv', 'text/csv');
  } else {
    _downloadBlob(JSON.stringify(sampleQuestions, null, 2), 'plantilla_trivia_oajnu.json', 'application/json');
  }
}

function _downloadBlob(content, filename, type) {
  const a = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href); // liberar memoria
}
