import { createRequire } from 'node:module'
import mammoth from 'mammoth'

const require = createRequire(import.meta.url)

const UTF8_DECODER = new TextDecoder('utf-8', { fatal: false })
const LATIN1_DECODER = new TextDecoder('latin1', { fatal: false })
const UTF16_DECODER = new TextDecoder('utf-16le', { fatal: false })

const TEXT_EXTENSIONS = new Set(['txt', 'md', 'csv'])

export class CvExtractionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CvExtractionError'
  }
}

function getExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : ''
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\u0000/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \u00a0]{2,}/g, ' ')
    .trim()
}

function decodePlainText(buffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(buffer)
  const utf8 = normalizeWhitespace(UTF8_DECODER.decode(uint8))
  if (utf8.length >= 40) return utf8

  const utf16 = normalizeWhitespace(UTF16_DECODER.decode(uint8))
  if (utf16.length >= 40) return utf16

  return normalizeWhitespace(LATIN1_DECODER.decode(uint8))
}

function stripRtf(text: string): string {
  return normalizeWhitespace(
    text
      .replace(/\\par[d]?/g, '\n')
      .replace(/\\tab/g, ' ')
      .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
      .replace(/\\u-?\d+\??/g, ' ')
      .replace(/\\[a-zA-Z]+-?\d* ?/g, ' ')
      .replace(/[{}]/g, ' ')
  )
}

function salvageTextFromBinary(buffer: ArrayBuffer): string {
  const byteText = LATIN1_DECODER.decode(new Uint8Array(buffer))
  const byteMatches = byteText.match(/[\x20-\x7EÀ-ÿ]{3,}/g) ?? []

  const utf16Text = UTF16_DECODER.decode(new Uint8Array(buffer))
  const utf16Matches = utf16Text.match(/[A-Za-zÀ-ÿ0-9@._+\-()/:,\s]{3,}/g) ?? []

  return normalizeWhitespace([...byteMatches, ...utf16Matches].join('\n'))
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const PDFParser = require('pdf2json') as new (context?: unknown, needRawText?: boolean, password?: string) => unknown

  return await new Promise<string>((resolve, reject) => {
    const parser: {
      on: (event: string, listener: (...args: unknown[]) => void) => unknown
      parseBuffer: (pdfBuffer: Buffer, verbosity?: number) => void
      getRawTextContent: () => string
      destroy?: () => void
    } = new PDFParser(null, true) as {
      on: (event: string, listener: (...args: unknown[]) => void) => unknown
      parseBuffer: (pdfBuffer: Buffer, verbosity?: number) => void
      getRawTextContent: () => string
      destroy?: () => void
    }

    parser.on('pdfParser_dataError', (...args: unknown[]) => {
      const error = args[0] as { parserError?: Error } | Error
      parser.destroy?.()
      reject(error instanceof Error ? error : error.parserError ?? new Error('No se pudo parsear el PDF.'))
    })

    parser.on('pdfParser_dataReady', () => {
      try {
        const text = normalizeWhitespace(parser.getRawTextContent())
        parser.destroy?.()
        resolve(text)
      } catch (error) {
        parser.destroy?.()
        reject(error)
      }
    })

    parser.parseBuffer(Buffer.from(buffer), 0)
  })
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
  return normalizeWhitespace(result.value)
}

export async function extractCvText(file: File): Promise<string> {
  const extension = getExtension(file.name)
  const buffer = await file.arrayBuffer()

  if (extension === 'pdf') {
    return extractPdfText(buffer)
  }

  if (extension === 'docx') {
    return extractDocxText(buffer)
  }

  if (extension === 'rtf') {
    return stripRtf(decodePlainText(buffer))
  }

  if (TEXT_EXTENSIONS.has(extension)) {
    return decodePlainText(buffer)
  }

  if (extension === 'doc') {
    const salvaged = salvageTextFromBinary(buffer)
    if (salvaged.length >= 80) return salvaged

    throw new CvExtractionError(
      'No se pudo leer este archivo .doc legado. Convertí el CV a PDF, DOCX o TXT.'
    )
  }

  const fallback = salvageTextFromBinary(buffer)
  if (fallback.length >= 80) return fallback

  throw new CvExtractionError(
    'No se pudo extraer texto legible del archivo. Usá PDF con texto seleccionable, DOCX, TXT o RTF.'
  )
}
