import type { ParsedFileMetadata } from '../types/metadata'
import type { HistoryAction, HistoryEntry, HistoryFieldSnapshot } from '../types/history'

const STORAGE_KEY = 'metashield-history-v1'
const MAX_ENTRIES = 30
const MAX_FIELDS_PER_ENTRY = 32

function safeParse(json: string | null): HistoryEntry[] {
  if (!json) return []
  try {
    const data = JSON.parse(json) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(isHistoryEntry)
  } catch {
    return []
  }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false
  const e = value as HistoryEntry
  return (
    typeof e.id === 'string' &&
    typeof e.fileName === 'string' &&
    typeof e.at === 'string' &&
    Array.isArray(e.fields)
  )
}

export function loadHistory(): HistoryEntry[] {
  if (typeof localStorage === 'undefined') return []
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

function persist(entries: HistoryEntry[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
}

export function snapshotFields(parsed: ParsedFileMetadata): HistoryFieldSnapshot[] {
  return parsed.fields
    .filter((f) => f.id !== 'no-metadata' && f.id !== 'unsupported')
    .slice(0, MAX_FIELDS_PER_ENTRY)
    .map((f) => ({
      id: f.id,
      label: f.label,
      category: f.category,
      value: f.value,
      sensitive: f.sensitive,
    }))
}

export function addHistoryEntry(
  parsed: ParsedFileMetadata,
  action: HistoryAction,
  options?: { exportFileName?: string; isSample?: boolean },
): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    fileName: parsed.fileName,
    fileSize: parsed.fileSize,
    mimeType: parsed.mimeType,
    kind: parsed.kind,
    action,
    at: new Date().toISOString(),
    fieldCount: parsed.fields.length,
    hadGps: parsed.fields.some((f) => f.id === 'gps'),
    fields: snapshotFields(parsed),
    exportFileName: options?.exportFileName,
    isSample: options?.isSample,
  }

  const next = [entry, ...loadHistory().filter((e) => e.id !== entry.id)]
  persist(next)
  return entry
}

export function updateHistoryEntry(
  id: string,
  patch: Partial<Pick<HistoryEntry, 'action' | 'exportFileName'>>,
): HistoryEntry | null {
  const entries = loadHistory()
  const index = entries.findIndex((e) => e.id === id)
  if (index === -1) return null

  const updated: HistoryEntry = {
    ...entries[index],
    ...patch,
    at: new Date().toISOString(),
  }
  entries[index] = updated
  persist(entries)
  return updated
}

export function removeHistoryEntry(id: string): void {
  persist(loadHistory().filter((e) => e.id !== id))
}

export function clearHistory(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

export const ACTION_LABELS: Record<HistoryAction, string> = {
  scanned: 'Scanned',
  exported: 'Exported',
  cleaned: 'Cleaned all',
}
