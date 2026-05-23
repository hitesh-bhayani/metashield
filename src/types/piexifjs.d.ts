declare module 'piexifjs' {
  export interface ExifDict {
    '0th': Record<number, string>
    Exif: Record<number, string>
    GPS?: Record<number, unknown>
    Interop?: Record<number, unknown>
    '1st'?: Record<number, unknown>
    thumbnail?: string | null
  }

  export const ImageIFD: {
    Artist: number
    Copyright: number
    ImageDescription: number
  }

  export const ExifIFD: {
    UserComment: number
  }

  export const GPSIFD: {
    GPSLatitudeRef: number
    GPSLatitude: number
    GPSLongitudeRef: number
    GPSLongitude: number
  }

  export const GPSHelper: {
    degToDmsRational: (deg: number) => [[number, number], [number, number], [number, number]]
  }

  export function load(dataUrl: string): ExifDict
  export function dump(exifObj: ExifDict): string
  export function insert(exifBytes: string, dataUrl: string): string
  export function remove(dataUrl: string): string

  const piexif: {
    load: typeof load
    dump: typeof dump
    insert: typeof insert
    remove: typeof remove
    ImageIFD: typeof ImageIFD
    ExifIFD: typeof ExifIFD
    GPSIFD: typeof GPSIFD
    GPSHelper: typeof GPSHelper
  }

  export default piexif
}
