/** PDF de la hoja dominical en public/pdf/ */
export const HOJA_DOMINICAL_PDF_PATH = "/pdf/hoja-dominical.pdf"

/** URL del PDF que abre el botón «Hoja dominical». */
export function getHojaDominicalUrl(_semana?: number): string {
  return HOJA_DOMINICAL_PDF_PATH
}
