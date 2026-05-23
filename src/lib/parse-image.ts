import exifr from 'exifr'
import type { ParsedFileMetadata } from '../types/metadata'
import { fieldsFromExifRaw } from './fields'

export async function parseImage(file: File): Promise<ParsedFileMetadata> {
  const raw =
    (await exifr.parse(file, {
      gps: true,
      exif: true,
      xmp: true,
      iptc: true,
      reviveValues: true,
    })) ?? {}

  const fields = fieldsFromExifRaw(raw as Record<string, unknown>)
  const hasGps = fields.some((f) => f.id === 'gps')
  const isJpeg =
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg')

  if (fields.length === 0) {
    fields.push({
      id: 'no-metadata',
      label: 'Embedded metadata',
      category: 'other',
      value: 'No EXIF/IPTC/XMP blocks detected in this file',
      originalValue: 'No EXIF/IPTC/XMP blocks detected in this file',
      editable: false,
      hint: 'You can still export a clean copy without metadata',
    })
  }

  return {
    kind: 'image',
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'image/*',
    fields,
    supportsGpsRemoval: hasGps,
    supportsExifEdit: isJpeg,
  }
}
