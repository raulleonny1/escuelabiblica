/**
 * Google TTS y otras voces leen «6:25» o «22:54» como hora (dice «mañana», «noche»).
 * Convierte referencias bíblicas capítulo:versículo a texto hablado.
 */
export function normalizarTextoParaTts(texto: string): string {
  return (
    texto
      // 6:25-34 → 6 versículo 25 a 34
      .replace(/(\d+):(\d+)(?:-(\d+))?/g, (_, cap, v1, v2) => {
        if (v2) return `${cap} versículo ${v1} a ${v2}`
        return `${cap} versículo ${v1}`
      })
      // Abreviatura Cap. 3 → capítulo 3
      .replace(/\bCap\.\s*(\d+)/gi, "capítulo $1")
      .replace(/\s+/g, " ")
      .trim()
  )
}
