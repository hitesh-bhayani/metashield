import { PDFDocument } from 'pdf-lib'
import type { MetadataField, ParsedFileMetadata } from '../types/metadata'
import { createField } from './fields'
import { formatDate } from './format'

const PDF_EDITABLE: Array<{
  id: string
  label: string
  read: (doc: PDFDocument) => string | undefined
}> = [
  { id: 'title', label: 'Title', read: (d) => d.getTitle() ?? undefined },
  { id: 'author', label: 'Author', read: (d) => d.getAuthor() ?? undefined },
  { id: 'subject', label: 'Subject', read: (d) => d.getSubject() ?? undefined },
  {
    id: 'keywords',
    label: 'Keywords',
    read: (d) => d.getKeywords() ?? undefined,
  },
  { id: 'creator', label: 'Creator app', read: (d) => d.getCreator() ?? undefined },
  {
    id: 'producer',
    label: 'Producer',
    read: (d) => d.getProducer() ?? undefined,
  },
]

export async function parsePdf(file: File): Promise<ParsedFileMetadata> {
  const bytes = await file.arrayBuffer()
  const doc = await PDFDocument.load(bytes, { updateMetadata: false })
  const fields: MetadataField[] = []

  for (const spec of PDF_EDITABLE) {
    const raw = spec.read(doc)?.trim()
    const field = createField(spec.id, spec.label, 'document', raw ?? null, {
      editable: true,
      sensitive: spec.id === 'author',
      hint:
        spec.id === 'author'
          ? 'Often your name or organization'
          : undefined,
    })
    if (field) fields.push(field)
  }

  const created = formatDate(doc.getCreationDate())
  const createdField = createField('pdf-created', 'Created', 'time', created)
  if (createdField) fields.push(createdField)

  const modified = formatDate(doc.getModificationDate())
  const modifiedField = createField('pdf-modified', 'Modified', 'time', modified)
  if (modifiedField) fields.push(modifiedField)

  const pages = createField(
    'page-count',
    'Page count',
    'technical',
    String(doc.getPageCount()),
  )
  if (pages) fields.push(pages)

  if (fields.length === 0) {
    fields.push({
      id: 'no-metadata',
      label: 'Document metadata',
      category: 'other',
      value: 'No standard PDF info dictionary fields found',
      originalValue: 'No standard PDF info dictionary fields found',
      editable: false,
    })
  }

  return {
    kind: 'pdf',
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/pdf',
    fields,
    supportsGpsRemoval: false,
    supportsExifEdit: false,
    pageCount: doc.getPageCount(),
  }
}
