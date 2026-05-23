import { useEffect, useState } from 'react'
import { FileText, ImageIcon } from 'lucide-react'
import type { ParsedFileMetadata } from '../types/metadata'
import { formatBytes } from '../lib/format'

interface FilePreviewProps {
  file: File
  parsed: ParsedFileMetadata
}

export function FilePreview({ file, parsed }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (parsed.kind !== 'image') {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file, parsed.kind])

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-100">{parsed.fileName}</p>
          <p className="text-sm text-slate-500">
            {formatBytes(parsed.fileSize)} · {parsed.mimeType}
            {parsed.pageCount != null ? ` · ${parsed.pageCount} pages` : ''}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-300">
          {parsed.kind}
        </span>
      </div>

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="max-h-48 w-full rounded-lg object-contain bg-slate-950"
        />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-lg bg-slate-950 text-slate-600">
          {parsed.kind === 'pdf' ? (
            <FileText className="h-12 w-12" aria-hidden />
          ) : (
            <ImageIcon className="h-12 w-12" aria-hidden />
          )}
        </div>
      )}
    </div>
  )
}
