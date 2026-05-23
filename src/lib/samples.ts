import { PDFDocument, rgb } from 'pdf-lib'
import piexif, { type ExifDict } from 'piexifjs'
import { cleanStringForPiexif } from './format'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'))
    reader.readAsDataURL(blob)
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

async function renderSampleCanvas(): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 520
  canvas.height = 340
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#312e81')
  gradient.addColorStop(1, '#0f172a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(24, 24, canvas.width - 48, canvas.height - 48)

  ctx.fillStyle = '#e2e8f0'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.fillText('MetaShield sample photo', 48, 72)
  ctx.font = '16px system-ui, sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.fillText('Contains GPS, camera & author EXIF', 48, 104)
  ctx.fillText('for demo purposes only', 48, 130)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('JPEG export failed'))),
      'image/jpeg',
      0.92,
    )
  })
}

export async function createSampleImage(): Promise<File> {
  const jpegBlob = await renderSampleCanvas()
  const dataUrl = await blobToDataUrl(jpegBlob)

  const exifObj: ExifDict = {
    '0th': {
      [piexif.ImageIFD.Artist]: cleanStringForPiexif('Sample Resident'),
      [piexif.ImageIFD.Copyright]: cleanStringForPiexif('© 2026 Greenview Housing Society'),
      [piexif.ImageIFD.ImageDescription]: cleanStringForPiexif(
        'AGM notice board photo (sample metadata)',
      ),
    },
    Exif: {
      [piexif.ExifIFD.UserComment]: cleanStringForPiexif(
        'Demo file — includes GPS near Bengaluru for testing',
      ),
    },
    GPS: {
      [piexif.GPSIFD.GPSLatitudeRef]: 'N',
      [piexif.GPSIFD.GPSLatitude]: piexif.GPSHelper.degToDmsRational(12.9716),
      [piexif.GPSIFD.GPSLongitudeRef]: 'E',
      [piexif.GPSIFD.GPSLongitude]: piexif.GPSHelper.degToDmsRational(77.5946),
    },
  }

  const exifBytes = piexif.dump(exifObj)
  const withExif = piexif.insert(exifBytes, dataUrl)
  const out = dataUrlToBlob(withExif)
  return new File([out], 'sample-photo.jpg', { type: 'image/jpeg' })
}

export async function createSamplePdf(): Promise<File> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([520, 340])
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 520,
    height: 340,
    color: rgb(0.06, 0.09, 0.16),
  })
  page.drawText('MetaShield sample PDF', {
    x: 48,
    y: 280,
    size: 20,
    color: rgb(0.9, 0.92, 0.96),
  })
  page.drawText('Author, title & subject metadata attached', {
    x: 48,
    y: 250,
    size: 12,
    color: rgb(0.58, 0.64, 0.72),
  })

  doc.setTitle('Internal maintenance ledger (sample)')
  doc.setAuthor('Greenview Society Secretary')
  doc.setSubject('Quarterly dues — demo document')
  doc.setKeywords(['housing', 'sample', 'metashield', 'demo'])
  doc.setCreator('MetaShield Demo Generator')
  doc.setProducer('pdf-lib')

  const bytes = await doc.save()
  return new File([bytes as BlobPart], 'sample-report.pdf', {
    type: 'application/pdf',
  })
}

export const SAMPLE_OPTIONS = [
  {
    id: 'photo',
    title: 'Sample photo',
    description: 'JPEG with GPS, author, copyright & comment',
    create: createSampleImage,
  },
  {
    id: 'pdf',
    title: 'Sample PDF',
    description: 'PDF with title, author, subject & keywords',
    create: createSamplePdf,
  },
] as const
