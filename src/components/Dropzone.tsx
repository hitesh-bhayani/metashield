import { useDropzone } from 'react-dropzone'
import { Upload, FileImage, FileText } from 'lucide-react'
import { cn } from '../lib/cn'

interface DropzoneProps {
  onFile: (file: File) => void
  disabled?: boolean
}

export function Dropzone({ onFile, disabled }: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      disabled,
      multiple: false,
      accept: {
        'image/jpeg': ['.jpeg', '.jpg', '.JPEG', '.JPG'],
        'image/png': ['.png', '.PNG'],
        'image/webp': ['.webp', '.WEBP'],
        'image/gif': ['.gif', '.GIF'],
        'application/pdf': ['.pdf', '.PDF'],
      },
      onDrop: (files) => {
        if (files[0]) onFile(files[0])
      },
    })

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition',
          isDragActive
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <input {...getInputProps()} data-testid="file-input" />
        <Upload className="mx-auto mb-3 h-8 w-8 text-indigo-400" aria-hidden />
        <p className="font-medium text-slate-200">
          {isDragActive ? 'Drop file here' : 'Drop an image or PDF'}
        </p>
        <p className="mt-1 text-sm text-slate-500">or click to browse</p>
        <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <FileImage className="h-3.5 w-3.5" /> JPEG, PNG, WebP
          </span>
          <span className="inline-flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> PDF
          </span>
        </div>
      </div>
      {fileRejections.length > 0 && (
        <p className="text-sm text-rose-400" role="alert">
          {fileRejections[0]?.errors[0]?.message ?? 'File not accepted'}
        </p>
      )}
    </div>
  )
}
