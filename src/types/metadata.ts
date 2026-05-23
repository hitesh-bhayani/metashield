export type MetadataCategory =
  | 'location'
  | 'device'
  | 'time'
  | 'identity'
  | 'software'
  | 'document'
  | 'technical'
  | 'other'

export type SupportedFileKind = 'image' | 'pdf' | 'unsupported'

export interface MetadataField {
  id: string
  label: string
  category: MetadataCategory
  value: string
  originalValue: string
  editable: boolean
  sensitive?: boolean
  hint?: string
}

export interface ParsedFileMetadata {
  kind: SupportedFileKind
  fileName: string
  fileSize: number
  mimeType: string
  fields: MetadataField[]
  supportsGpsRemoval: boolean
  supportsExifEdit: boolean
  pageCount?: number
}

export interface EditorState {
  values: Record<string, string>
  removeGps: boolean
  stripAllMetadata: boolean
}

export const CATEGORY_LABELS: Record<MetadataCategory, string> = {
  location: 'Location',
  device: 'Device',
  time: 'Date & time',
  identity: 'Identity & rights',
  software: 'Software',
  document: 'Document info',
  technical: 'Technical',
  other: 'Other',
}

export const CATEGORY_ORDER: MetadataCategory[] = [
  'location',
  'identity',
  'document',
  'device',
  'time',
  'software',
  'technical',
  'other',
]
