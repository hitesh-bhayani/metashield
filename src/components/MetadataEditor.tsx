import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type EditorState,
  type MetadataField,
  type ParsedFileMetadata,
} from '../types/metadata'
import { groupFieldsByCategory } from '../lib/fields'
import { cn } from '../lib/cn'
import { Lock, Pencil, AlertTriangle } from 'lucide-react'

interface MetadataEditorProps {
  parsed: ParsedFileMetadata
  editor: EditorState
  onChange: (next: EditorState) => void
}

export function MetadataEditor({ parsed, editor, onChange }: MetadataEditorProps) {
  const grouped = groupFieldsByCategory(parsed.fields)
  const hasChanges =
    editor.removeGps ||
    editor.stripAllMetadata ||
    parsed.fields.some(
      (f) => f.editable && editor.values[f.id] !== f.originalValue,
    )

  const updateValue = (id: string, value: string) => {
    onChange({ ...editor, values: { ...editor.values, [id]: value } })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Metadata report
        </h2>
        {hasChanges && (
          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-300">
            Unsaved edits
          </span>
        )}
      </div>

      {(parsed.supportsGpsRemoval || parsed.kind === 'image') && (
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Privacy actions
          </p>
          {parsed.supportsGpsRemoval && (
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                checked={editor.removeGps}
                onChange={(e) =>
                  onChange({ ...editor, removeGps: e.target.checked })
                }
                data-testid="remove-gps"
              />
              <span>
                <span className="font-medium text-slate-200">Remove GPS location</span>
                <span className="mt-0.5 block text-sm text-slate-500">
                  Strips coordinates from JPEG EXIF before export
                </span>
              </span>
            </label>
          )}
          {parsed.kind === 'image' && (
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                checked={editor.stripAllMetadata}
                onChange={(e) =>
                  onChange({ ...editor, stripAllMetadata: e.target.checked })
                }
                data-testid="strip-all"
              />
              <span>
                <span className="font-medium text-slate-200">
                  Strip all metadata (re-encode)
                </span>
                <span className="mt-0.5 block text-sm text-slate-500">
                  Best for PNG/WebP or maximum privacy — redraws image without EXIF
                </span>
              </span>
            </label>
          )}
        </div>
      )}

      {CATEGORY_ORDER.map((category) => {
        const fields = grouped.get(category)
        if (!fields?.length) return null

        return (
          <section
            key={category}
            className="overflow-hidden rounded-xl border border-slate-800"
          >
            <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
              <h3 className="text-sm font-medium text-slate-200">
                {CATEGORY_LABELS[category]}
                <span className="ml-2 text-slate-500">({fields.length})</span>
              </h3>
            </div>
            <ul className="divide-y divide-slate-800/80">
              {fields.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  value={editor.values[field.id] ?? field.value}
                  disabled={editor.stripAllMetadata && field.editable}
                  onValueChange={(v) => updateValue(field.id, v)}
                />
              ))}
            </ul>
          </section>
        )
      })}

      {!parsed.supportsExifEdit && parsed.kind === 'image' && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-200/90">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Text EXIF editing works on JPEG. For this file, use editable fields where shown
          or enable strip-all to export a clean copy.
        </p>
      )}
    </div>
  )
}

function FieldRow({
  field,
  value,
  disabled,
  onValueChange,
}: {
  field: MetadataField
  value: string
  disabled?: boolean
  onValueChange: (value: string) => void
}) {
  return (
    <li className="px-4 py-3">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-sm font-medium text-slate-300">{field.label}</span>
        {field.editable ? (
          <span className="inline-flex items-center gap-0.5 rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
            <Pencil className="h-2.5 w-2.5" /> Editable
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Lock className="h-2.5 w-2.5" /> Read-only
          </span>
        )}
        {field.sensitive && (
          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-300">
            Sensitive
          </span>
        )}
      </div>

      {field.editable && !disabled ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100',
            'placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
          )}
          aria-label={field.label}
          data-testid={`field-${field.id}`}
        />
      ) : (
        <p className="break-words text-sm text-slate-400">{field.value}</p>
      )}

      {field.hint && (
        <p className="mt-1 text-xs text-slate-600">{field.hint}</p>
      )}
    </li>
  )
}
