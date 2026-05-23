export type DiaLeccionId = "dom" | "lun" | "mar" | "mie" | "jue" | "vie" | "sab"

export type BloqueLeccion = {
  titulo: string
  texto: string
}

export type LeccionContenido = {
  numero: number
  titulo: string
  tema: string
  dias: Record<DiaLeccionId, BloqueLeccion[]>
}

export function repasoSemana(
  numero: number,
  titulo: string,
  textoClave: string,
  cuerpo: string,
  apoyos: string[],
  preguntas: string[],
  desafio: string
): BloqueLeccion[] {
  return [
    { titulo: "Texto clave de la semana", texto: textoClave },
    {
      titulo: "Repaso de la semana",
      texto: [
        cuerpo,
        "",
        "Temas de apoyo (lunes a jueves):",
        ...apoyos.map((t) => `• ${t}`),
        "",
        "Para reflexionar:",
        ...preguntas.map((p) => `• ${p}`),
        "",
        `Desafío del sábado: ${desafio}`,
      ].join("\n"),
    },
  ]
}
