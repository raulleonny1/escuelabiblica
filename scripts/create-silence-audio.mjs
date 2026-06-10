import { mkdirSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, "..", "public", "audio")
const outPath = join(outDir, "silence.wav")

/** WAV PCM mono 8 kHz — bucle para mantener sesión de audio en móviles. */
function crearWavSilencioso(segundos = 15) {
  const sampleRate = 8000
  const numChannels = 1
  const bitsPerSample = 16
  const blockAlign = (numChannels * bitsPerSample) / 8
  const byteRate = sampleRate * blockAlign
  const numSamples = sampleRate * segundos
  const dataSize = numSamples * blockAlign
  const buf = Buffer.alloc(44 + dataSize)

  buf.write("RIFF", 0)
  buf.writeUInt32LE(36 + dataSize, 4)
  buf.write("WAVE", 8)
  buf.write("fmt ", 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(numChannels, 22)
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(byteRate, 28)
  buf.writeUInt16LE(blockAlign, 32)
  buf.writeUInt16LE(bitsPerSample, 34)
  buf.write("data", 36)
  buf.writeUInt32LE(dataSize, 40)

  return buf
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, crearWavSilencioso())
console.log("Creado public/audio/silence.wav")
