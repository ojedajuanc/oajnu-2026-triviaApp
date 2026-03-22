/**
 * Constantes globales de la aplicación.
 * Centralizar acá evita magic strings dispersos por el código.
 */

export const SEDES = [
  'Buenos Aires', 'Córdoba', 'Corrientes', 'Chaco',
  'Rosario', 'Mendoza', 'Tucumán', 'Salta',
];

export const TEAM_COLORS = [
  '#E05206', '#009AA6', '#c0392b', '#16a085',
  '#8e44ad', '#d35400', '#27ae60',
];

/** Configuración de cada nivel de dificultad */
export const DIFF = {
  easy: { label: 'Fácil',   pts: 10, cssClass: 'badge--easy' },
  mid:  { label: 'Media',   pts: 15, cssClass: 'badge--mid'  },
  hard: { label: 'Difícil', pts: 20, cssClass: 'badge--hard' },
};

export const MAX_TEAMS   = 7;
export const PENALTY_PTS = -5;

/** Modos de buzz disponibles */
export const BUZZ_MODE = {
  MODERATOR:   'moderator',   // el moderador presiona el botón manualmente
  PARTICIPANT: 'participant', // cada participante tiene su propio botón en el celu
};