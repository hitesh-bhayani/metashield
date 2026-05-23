import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addHistoryEntry,
  clearHistory,
  formatRelativeTime,
  loadHistory,
  removeHistoryEntry,
  snapshotFields,
  updateHistoryEntry,
} from './history'
import type { ParsedFileMetadata } from '../types/metadata'

const mockParsed: ParsedFileMetadata = {
  kind: 'pdf',
  fileName: 'test.pdf',
  fileSize: 2048,
  mimeType: 'application/pdf',
  supportsGpsRemoval: false,
  supportsExifEdit: false,
  fields: [
    {
      id: 'title',
      label: 'Title',
      category: 'document',
      value: 'Hello',
      originalValue: 'Hello',
      editable: true,
    },
    {
      id: 'gps',
      label: 'GPS',
      category: 'location',
      value: '1, 2',
      originalValue: '1, 2',
      editable: false,
      sensitive: true,
    },
  ],
}

describe('history storage', () => {
  beforeEach(() => {
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
    })
    clearHistory()
  })

  it('snapshots fields without noise ids', () => {
    const snap = snapshotFields(mockParsed)
    expect(snap).toHaveLength(2)
    expect(snap[0].label).toBe('Title')
  })

  it('adds and loads entries newest first', () => {
    addHistoryEntry(mockParsed, 'scanned')
    const list = loadHistory()
    expect(list).toHaveLength(1)
    expect(list[0].fileName).toBe('test.pdf')
    expect(list[0].hadGps).toBe(true)
  })

  it('updates entry on export', () => {
    const entry = addHistoryEntry(mockParsed, 'scanned')
    updateHistoryEntry(entry.id, {
      action: 'cleaned',
      exportFileName: 'test-edited.pdf',
    })
    const updated = loadHistory()[0]
    expect(updated.action).toBe('cleaned')
    expect(updated.exportFileName).toBe('test-edited.pdf')
  })

  it('removes single entry', () => {
    const entry = addHistoryEntry(mockParsed, 'scanned')
    removeHistoryEntry(entry.id)
    expect(loadHistory()).toHaveLength(0)
  })

  it('formatRelativeTime returns human string', () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe('just now')
  })
})
