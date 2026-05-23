import { useMemo, useState } from 'react'
import {
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  History,
  FileImage,
  FileText,
  X,
} from 'lucide-react'
import type { HistoryEntry } from '../types/history'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../types/metadata'
import {
  ACTION_LABELS,
  formatRelativeTime,
} from '../lib/history'
import { formatBytes } from '../lib/format'
import { cn } from '../lib/cn'

type Filter = 'all' | 'exported' | 'cleaned'

interface HistoryPanelProps {
  entries: HistoryEntry[]
  onRemove: (id: string) => void
  onClearAll: () => void
  disabled?: boolean
}

export function HistoryPanel({
  entries,
  onRemove,
  onClearAll,
  disabled,
}: HistoryPanelProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailEntry, setDetailEntry] = useState<HistoryEntry | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return entries
    if (filter === 'exported') {
      return entries.filter((e) => e.action === 'exported' || e.action === 'cleaned')
    }
    return entries.filter((e) => e.action === 'cleaned')
  }, [entries, filter])

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'exported', label: 'Exported' },
    { id: 'cleaned', label: 'Cleaned' },
  ]

  return (
    <>
      <section
        className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5"
        aria-labelledby="history-heading"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-400" aria-hidden />
            <h2
              id="history-heading"
              className="text-sm font-semibold uppercase tracking-wider text-slate-400"
            >
              Recent activity
            </h2>
          </div>
          {entries.length > 0 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (window.confirm('Clear all history on this device?')) onClearAll()
              }}
              className="text-xs text-slate-500 hover:text-rose-400 disabled:opacity-50"
            >
              Clear all
            </button>
          )}
        </div>

        <p className="mb-4 text-sm text-slate-500">
          Saved locally in your browser (metadata summary only — files are not
          stored).
        </p>

        {entries.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                disabled={disabled}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  filter === f.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 py-8 text-center text-sm text-slate-500">
            {entries.length === 0
              ? 'No history yet. Scan or export a file to see it here.'
              : 'No items match this filter.'}
          </p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {filtered.map((entry) => (
              <li key={entry.id}>
                <div
                  className={cn(
                    'rounded-xl border border-slate-800 bg-slate-950/60 transition',
                    expandedId === entry.id && 'border-indigo-500/30',
                  )}
                >
                  <div className="flex items-start gap-2 p-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                      {entry.kind === 'pdf' ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <FileImage className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-200">
                        {entry.fileName}
                        {entry.isSample && (
                          <span className="ml-2 text-[10px] font-normal uppercase text-indigo-400">
                            sample
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(entry.at)}
                        </span>
                        <span>·</span>
                        <span>{formatBytes(entry.fileSize)}</span>
                        <span>·</span>
                        <span>{entry.fieldCount} fields</span>
                        {entry.hadGps && (
                          <>
                            <span>·</span>
                            <span className="text-amber-500/90">GPS</span>
                          </>
                        )}
                      </p>
                      <span
                        className={cn(
                          'mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                          entry.action === 'cleaned'
                            ? 'bg-rose-500/15 text-rose-300'
                            : entry.action === 'exported'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-slate-800 text-slate-400',
                        )}
                      >
                        {ACTION_LABELS[entry.action]}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() =>
                          setExpandedId(expandedId === entry.id ? null : entry.id)
                        }
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                        aria-label={expandedId === entry.id ? 'Collapse' : 'Expand'}
                      >
                        {expandedId === entry.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onRemove(entry.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
                        aria-label="Remove from history"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {expandedId === entry.id && (
                    <div className="border-t border-slate-800 px-3 pb-3 pt-2">
                      <HistoryFieldList entry={entry} compact />
                      <button
                        type="button"
                        onClick={() => setDetailEntry(entry)}
                        className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                      >
                        View full report →
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {detailEntry && (
        <HistoryDetailModal
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
        />
      )}
    </>
  )
}

function HistoryFieldList({
  entry,
  compact,
}: {
  entry: HistoryEntry
  compact?: boolean
}) {
  const byCategory = new Map<string, typeof entry.fields>()
  for (const field of entry.fields) {
    const list = byCategory.get(field.category) ?? []
    list.push(field)
    byCategory.set(field.category, list)
  }

  const limit = compact ? 6 : entry.fields.length
  let shown = 0

  return (
    <div className="space-y-2 text-xs">
      {CATEGORY_ORDER.map((cat) => {
        const fields = byCategory.get(cat)
        if (!fields?.length || shown >= limit) return null
        return (
          <div key={cat}>
            <p className="font-medium text-slate-500">{CATEGORY_LABELS[cat]}</p>
            <ul className="mt-1 space-y-1">
              {fields.map((f) => {
                if (shown >= limit) return null
                shown++
                return (
                  <li key={f.id} className="text-slate-400">
                    <span className="text-slate-500">{f.label}: </span>
                    <span className={f.sensitive ? 'text-amber-400/90' : ''}>
                      {f.value}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
      {compact && entry.fields.length > limit && (
        <p className="text-slate-600">+{entry.fields.length - limit} more fields</p>
      )}
    </div>
  )
}

function HistoryDetailModal({
  entry,
  onClose,
}: {
  entry: HistoryEntry
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-detail-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h3 id="history-detail-title" className="font-semibold text-white">
              {entry.fileName}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {formatRelativeTime(entry.at)} · {ACTION_LABELS[entry.action]}
              {entry.exportFileName && ` → ${entry.exportFileName}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">
          <HistoryFieldList entry={entry} />
          <p className="mt-4 text-xs text-slate-600">
            Re-upload the original file to edit again. History stores metadata
            summaries only.
          </p>
        </div>
      </div>
    </div>
  )
}
