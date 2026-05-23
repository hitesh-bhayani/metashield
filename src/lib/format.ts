export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatGps(lat?: number, lon?: number): string | null {
  if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) {
    return null
  }
  const latH = lat >= 0 ? 'N' : 'S'
  const lonH = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(6)}° ${latH}, ${Math.abs(lon).toFixed(6)}° ${lonH}`
}

export function formatDate(value: unknown): string | null {
  if (value == null) return null
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleString()
  }
  if (typeof value === 'string' && value.trim()) return value.trim()
  return null
}

export function asString(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return null
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function buildExportName(originalName: string, suffix = 'edited'): string {
  const dot = originalName.lastIndexOf('.')
  if (dot === -1) return `${originalName}-${suffix}`
  const base = originalName.slice(0, dot)
  const ext = originalName.slice(dot)
  return `${base}-${suffix}${ext}`
}

export function cleanStringForPiexif(str: string): string {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return binary
}

