import type { MetadataCategory, SupportedFileKind } from './metadata'

export type HistoryAction = 'scanned' | 'exported' | 'cleaned'

export interface HistoryFieldSnapshot {
  id: string
  label: string
  category: MetadataCategory
  value: string
  sensitive?: boolean
}

export interface HistoryEntry {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  kind: SupportedFileKind
  action: HistoryAction
  at: string
  fieldCount: number
  hadGps: boolean
  fields: HistoryFieldSnapshot[]
  exportFileName?: string
  isSample?: boolean
}
