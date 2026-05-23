import { FileImage, FileText, Sparkles } from 'lucide-react'
import { SAMPLE_OPTIONS } from '../lib/samples'
import { cn } from '../lib/cn'

interface SampleFilesProps {
  onSample: (file: File) => void
  disabled?: boolean
  compact?: boolean
}

export function SampleFiles({ onSample, disabled, compact }: SampleFilesProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-800 bg-slate-900/40 p-5',
        compact && 'p-4',
      )}
      aria-labelledby="samples-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-400" aria-hidden />
        <h2
          id="samples-heading"
          className="text-sm font-semibold uppercase tracking-wider text-slate-400"
        >
          Try sample files
        </h2>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Load a demo file to see how metadata is reported and edited — no upload
        needed.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SAMPLE_OPTIONS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            data-testid={`sample-${sample.id}`}
            onClick={async () => {
              const file = await sample.create()
              onSample(file)
            }}
            className={cn(
              'flex flex-col items-start gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-left transition',
              'hover:border-indigo-500/50 hover:bg-slate-900 disabled:opacity-50',
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              {sample.id === 'photo' ? (
                <FileImage className="h-5 w-5" aria-hidden />
              ) : (
                <FileText className="h-5 w-5" aria-hidden />
              )}
            </span>
            <span className="font-medium text-slate-200">{sample.title}</span>
            <span className="text-xs leading-relaxed text-slate-500">
              {sample.description}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
