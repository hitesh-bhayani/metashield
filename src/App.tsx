import { useCallback, useRef, useState } from 'react'
import { Download, Eraser, Loader2, RotateCcw } from 'lucide-react'
import { Header } from './components/Header'
import { Dropzone } from './components/Dropzone'
import { FilePreview } from './components/FilePreview'
import { MetadataEditor } from './components/MetadataEditor'
import { SampleFiles } from './components/SampleFiles'
import { HistoryPanel } from './components/HistoryPanel'
import { useHistory } from './hooks/useHistory'
import { parseFile } from './lib/parse'
import { buildEditorState } from './lib/fields'
import { buildCleanAllState } from './lib/clean'
import { exportFile } from './lib/export'
import { downloadBlob } from './lib/format'
import type { EditorState, ParsedFileMetadata } from './types/metadata'
import type { HistoryAction } from './types/history'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

function isSampleFileName(name: string) {
  return name.startsWith('sample-')
}

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedFileMetadata | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const history = useHistory()
  const currentHistoryId = useRef<string | null>(null)

  const handleFile = useCallback(
    async (next: File) => {
      setLoadState('loading')
      setError(null)
      setFile(next)
      currentHistoryId.current = null
      try {
        const result = await parseFile(next)
        if (result.kind === 'unsupported') {
          setParsed(result)
          setEditor(null)
          setLoadState('error')
          setError('This file type is not supported yet.')
          return
        }
        setParsed(result)
        setEditor(buildEditorState(result.fields))
        setLoadState('ready')
        currentHistoryId.current = history.recordScan(
          result,
          isSampleFileName(next.name),
        )
      } catch (err) {
        setLoadState('error')
        setError(err instanceof Error ? err.message : 'Failed to read metadata')
        setParsed(null)
        setEditor(null)
      }
    },
    [history],
  )

  const reset = () => {
    setFile(null)
    setParsed(null)
    setEditor(null)
    setLoadState('idle')
    setError(null)
    currentHistoryId.current = null
  }

  const resetEdits = () => {
    if (!parsed) return
    setEditor(buildEditorState(parsed.fields))
  }

  const runExport = async (
    editorState: EditorState,
    historyAction: Extract<HistoryAction, 'exported' | 'cleaned'> = 'exported',
  ) => {
    if (!file || !parsed || parsed.kind === 'unsupported') return
    setExporting(true)
    setError(null)
    try {
      const { blob, fileName } = await exportFile(file, parsed, editorState)
      downloadBlob(blob, fileName)
      if (currentHistoryId.current) {
        history.recordExport(currentHistoryId.current, historyAction, fileName)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleExport = async () => {
    if (!editor) return
    await runExport(editor, 'exported')
  }

  const handleCleanAllAndDownload = async () => {
    if (!parsed || !editor) return
    const cleaned = buildCleanAllState(parsed, editor)
    setEditor(cleaned)
    await runExport(cleaned, 'cleaned')
  }

  const busy = exporting || loadState === 'loading'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
        {loadState === 'idle' && (
          <div className="mx-auto max-w-xl space-y-8">
            <Dropzone onFile={handleFile} />
            <p className="text-center text-sm leading-relaxed text-slate-500">
              Upload a photo or PDF to see embedded metadata grouped by type.
              Edit fields marked{' '}
              <span className="text-indigo-400">editable</span>, then download an
              updated file — all on your device.
            </p>
          </div>
        )}

        {loadState === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p>Reading metadata…</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="mx-auto max-w-xl space-y-4">
            <div
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"
              role="alert"
            >
              {error}
            </div>
            <Dropzone onFile={handleFile} />
            {parsed && file && (
              <button
                type="button"
                onClick={reset}
                className="text-sm text-slate-500 underline hover:text-slate-300"
              >
                Start over
              </button>
            )}
          </div>
        )}

        {loadState === 'ready' && file && parsed && editor && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
            <aside className="space-y-4">
              <FilePreview file={file} parsed={parsed} />
              <Dropzone onFile={handleFile} disabled={busy} />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={busy || parsed.kind === 'unsupported'}
                  data-testid="export-button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Apply & download
                </button>
                <button
                  type="button"
                  onClick={handleCleanAllAndDownload}
                  disabled={busy || parsed.kind === 'unsupported'}
                  data-testid="clean-all-button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-50"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eraser className="h-4 w-4" />
                  )}
                  Clean all & download
                </button>
                <button
                  type="button"
                  onClick={resetEdits}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset edits
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={busy}
                  className="text-sm text-slate-500 hover:text-slate-300"
                >
                  New file
                </button>
              </div>
              {error && (
                <p className="text-sm text-rose-400" role="alert">
                  {error}
                </p>
              )}
            </aside>

            <MetadataEditor
              parsed={parsed}
              editor={editor}
              onChange={setEditor}
            />
          </div>
        )}

        {loadState !== 'loading' && (
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
            <SampleFiles onSample={handleFile} disabled={busy} />
            <HistoryPanel
              entries={history.entries}
              onRemove={history.removeEntry}
              onClearAll={history.clearAll}
              disabled={busy}
            />
          </div>
        )}
      </main>
    </div>
  )
}
