import { useCallback, useState } from 'react'
import type { ParsedFileMetadata } from '../types/metadata'
import type { HistoryAction, HistoryEntry } from '../types/history'
import {
  addHistoryEntry,
  clearHistory,
  loadHistory,
  removeHistoryEntry,
  updateHistoryEntry,
} from '../lib/history'

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory())

  const refresh = useCallback(() => {
    setEntries(loadHistory())
  }, [])

  const recordScan = useCallback(
    (parsed: ParsedFileMetadata, isSample?: boolean) => {
      const entry = addHistoryEntry(parsed, 'scanned', { isSample })
      refresh()
      return entry.id
    },
    [refresh],
  )

  const recordExport = useCallback(
    (
      id: string,
      action: Extract<HistoryAction, 'exported' | 'cleaned'>,
      exportFileName: string,
    ) => {
      updateHistoryEntry(id, { action, exportFileName })
      refresh()
    },
    [refresh],
  )

  const removeEntry = useCallback(
    (id: string) => {
      removeHistoryEntry(id)
      refresh()
    },
    [refresh],
  )

  const clearAll = useCallback(() => {
    clearHistory()
    refresh()
  }, [refresh])

  return {
    entries,
    recordScan,
    recordExport,
    removeEntry,
    clearAll,
    refresh,
  }
}
