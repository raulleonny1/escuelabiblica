/** Ruta del worker de pdf.js (debe existir en public/pdf.worker.min.js; ver scripts/copy-pdf-worker.mjs). */
export function getPdfWorkerUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/pdf.worker.min.js`
  }
  return "/pdf.worker.min.js"
}
