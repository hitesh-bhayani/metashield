import { Shield } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/30">
            <Shield className="h-5 w-5 text-indigo-400" aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              MetaShield
            </h1>
            <p className="text-sm text-slate-400">
              Inspect, edit, and export file metadata
            </p>
          </div>
        </div>
        <p className="hidden max-w-xs text-right text-xs text-slate-500 sm:block">
          100% in your browser — files are never uploaded
        </p>
      </div>
    </header>
  )
}
