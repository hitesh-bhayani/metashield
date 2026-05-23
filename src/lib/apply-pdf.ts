import { PDFDocument } from 'pdf-lib'
import type { EditorState } from '../types/metadata'

const PDF_FIELD_SETTERS: Record<
  string,
  (doc: PDFDocument, value: string) => void
> = {
  title: (doc, v) => doc.setTitle(v),
  author: (doc, v) => doc.setAuthor(v),
  subject: (doc, v) => doc.setSubject(v),
  keywords: (doc, v) => doc.setKeywords(v.split(',').map((k) => k.trim()).filter(Boolean)),
  creator: (doc, v) => doc.setCreator(v),
  producer: (doc, v) => doc.setProducer(v),
}

export async function applyPdfChanges(
  file: File,
  editor: EditorState,
): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes)

  for (const [id, setter] of Object.entries(PDF_FIELD_SETTERS)) {
    const value = editor.values[id]
    if (value !== undefined) {
      setter(doc, value.trim())
    }
  }

  if (editor.stripAllMetadata) {
    doc.setTitle('')
    doc.setAuthor('')
    doc.setSubject('')
    doc.setKeywords([])
    doc.setCreator('')
    doc.setProducer('')
  }

  const out = await doc.save()
  return new Blob([out as BlobPart], { type: 'application/pdf' })
}
