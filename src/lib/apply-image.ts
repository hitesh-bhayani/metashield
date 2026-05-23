import piexif, { type ExifDict } from 'piexifjs'
import type { EditorState } from '../types/metadata'
import { cleanStringForPiexif } from './format'

const EXIF_MAP: Record<string, { ifd: string; tag: number }> = {
  artist: { ifd: '0th', tag: piexif.ImageIFD.Artist },
  copyright: { ifd: '0th', tag: piexif.ImageIFD.Copyright },
  description: { ifd: '0th', tag: piexif.ImageIFD.ImageDescription },
  userComment: { ifd: 'Exif', tag: piexif.ExifIFD.UserComment },
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export async function stripImageViaCanvas(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const quality = mime === 'image/jpeg' ? 0.92 : undefined

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))),
      mime,
      quality,
    )
  })
}

export async function applyImageChanges(
  file: File,
  editor: EditorState,
): Promise<Blob> {
  const isJpeg =
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg')

  if (editor.stripAllMetadata || !isJpeg) {
    return stripImageViaCanvas(file)
  }

  const dataUrl = await readFileAsDataUrl(file)
  let exifObj: ExifDict

  try {
    exifObj = piexif.load(dataUrl)
  } catch {
    return stripImageViaCanvas(file)
  }

  if (editor.removeGps && exifObj.GPS) {
    delete exifObj.GPS
  }

  for (const [id, mapping] of Object.entries(EXIF_MAP)) {
    const value = editor.values[id]
    if (value === undefined) continue
    const ifd = exifObj[mapping.ifd as keyof ExifDict] as Record<number, string>
    if (!ifd) continue
    if (value.trim() === '') {
      delete ifd[mapping.tag]
    } else {
      ifd[mapping.tag] = cleanStringForPiexif(value.trim())
    }
  }

  const exifBytes = piexif.dump(exifObj)
  const updated = piexif.insert(exifBytes, dataUrl)
  return dataUrlToBlob(updated)
}
