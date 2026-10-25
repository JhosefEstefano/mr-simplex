/**
 * Une clases condicionales sin dependencias externas.
 * @param {...(string|false|null|undefined)} clases
 * @returns {string}
 */
export function cn(...clases) {
  return clases.filter(Boolean).join(' ');
}
