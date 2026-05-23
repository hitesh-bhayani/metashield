import type { ParsedFileMetadata } from '../types/metadata'
import { parseImage } from './parse-image'
import { parsePdf } from './parse-pdf'

export async function parseFile(file: File): Promise<ParsedFileMetadata> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return parsePdf(file)
  }

  if (file.type.startsWith('image/')) {
    return parseImage(file)
  }

  return {
    kind: 'unsupported',
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    fields: [
      {
        id: 'unsupported',
        label: 'File type',
        category: 'other',
        value: file.type || 'Unknown type',
        originalValue: file.type || 'Unknown type',
        editable: false,
        hint: 'Supported: JPEG, PNG, WebP, GIF, PDF',
      },
    ],
    supportsGpsRemoval: false,
    supportsExifEdit: false,
  }
}
