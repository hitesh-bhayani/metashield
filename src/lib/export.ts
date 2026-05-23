import type { EditorState, ParsedFileMetadata } from '../types/metadata'
import { applyImageChanges } from './apply-image'
import { applyPdfChanges } from './apply-pdf'
import { buildExportName } from './format'

export async function exportFile(
  file: File,
  parsed: ParsedFileMetadata,
  editor: EditorState,
): Promise<{ blob: Blob; fileName: string }> {
  if (parsed.kind === 'pdf') {
    const blob = await applyPdfChanges(file, editor)
    return { blob, fileName: buildExportName(file.name) }
  }

  if (parsed.kind === 'image') {
    const blob = await applyImageChanges(file, editor)
    return { blob, fileName: buildExportName(file.name) }
  }

  throw new Error('Unsupported file type')
}
