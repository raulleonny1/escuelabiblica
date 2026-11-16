/** PDF fijo en public/pdf/ — botón «Hoja dominical». */
export const HOJA_DOMINICAL_PDF_FILE = "hd-15-11-2026.pdf"

/** Versión para evitar caché del service worker / navegador al cambiar de hoja. */
export const HOJA_DOMINICAL_VERSION = "20261116"

export const HOJA_DOMINICAL_PDF_URL = `/pdf/${HOJA_DOMINICAL_PDF_FILE}?v=${HOJA_DOMINICAL_VERSION}`
