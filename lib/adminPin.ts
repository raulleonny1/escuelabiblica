export const ADMIN_PIN_DEFAULT = "1844"

export function adminPinValido(pin: string): boolean {
  const esperado = process.env.ADMIN_PIN?.trim() || ADMIN_PIN_DEFAULT
  return pin.trim() === esperado
}
