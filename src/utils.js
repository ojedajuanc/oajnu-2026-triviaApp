/**
 * Utilidades de UI compartidas.
 */

/**
 * Escapa caracteres especiales HTML para prevenir XSS
 * en cualquier string insertado con innerHTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapa comillas para uso seguro en atributos HTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escAttr(value) {
  return String(value)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
