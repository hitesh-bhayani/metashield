import type { MetadataCategory, MetadataField } from '../types/metadata'
import { asString, formatDate, formatGps } from './format'

export function createField(
  id: string,
  label: string,
  category: MetadataCategory,
  value: string | null,
  options: {
    editable?: boolean
    sensitive?: boolean
    hint?: string
  } = {},
): MetadataField | null {
  if (!value) return null
  return {
    id,
    label,
    category,
    value,
    originalValue: value,
    editable: options.editable ?? false,
    sensitive: options.sensitive,
    hint: options.hint,
  }
}

export function groupFieldsByCategory(
  fields: MetadataField[],
): Map<MetadataCategory, MetadataField[]> {
  const map = new Map<MetadataCategory, MetadataField[]>()
  for (const field of fields) {
    const list = map.get(field.category) ?? []
    list.push(field)
    map.set(field.category, list)
  }
  return map
}

export function buildEditorState(fields: MetadataField[]): {
  values: Record<string, string>
  removeGps: boolean
  stripAllMetadata: boolean
} {
  const values: Record<string, string> = {}
  for (const field of fields) {
    if (field.editable) values[field.id] = field.value
  }
  return { values, removeGps: false, stripAllMetadata: false }
}

export function fieldsFromExifRaw(raw: Record<string, unknown>): MetadataField[] {
  const fields: MetadataField[] = []

  const gps = formatGps(
    raw.latitude as number | undefined,
    raw.longitude as number | undefined,
  )
  const gpsField = createField('gps', 'GPS coordinates', 'location', gps, {
    sensitive: true,
    hint: 'Precise location embedded in the image',
  })
  if (gpsField) fields.push(gpsField)

  const identityCandidates: Array<[string, string, string]> = [
    ['artist', 'Artist', 'Artist'],
    ['copyright', 'Copyright', 'Copyright'],
    ['description', 'Description', 'ImageDescription'],
    ['userComment', 'User comment', 'UserComment'],
  ]

  for (const [id, label, exifKey] of identityCandidates) {
    const fromExif = asString(raw[exifKey])
    const fromIptc =
      id === 'artist'
        ? asString(raw.Byline) ?? asString(raw['By-line'])
        : id === 'copyright'
          ? asString(raw.CopyrightNotice)
          : id === 'description'
            ? asString(raw.Caption) ?? asString(raw['Caption/Abstract'])
            : null

    const value = fromExif ?? fromIptc
    const field = createField(id, label, 'identity', value, {
      editable: true,
      sensitive: id === 'artist' || id === 'userComment',
    })
    if (field) fields.push(field)
  }

  const devicePairs: Array<[string, string, string[]]> = [
    ['make', 'Camera make', ['Make', 'make']],
    ['model', 'Camera model', ['Model', 'model']],
    ['lens', 'Lens', ['LensModel', 'lens']],
  ]
  for (const [id, label, keys] of devicePairs) {
    const value = keys.map((k) => asString(raw[k])).find(Boolean) ?? null
    const field = createField(id, label, 'device', value)
    if (field) fields.push(field)
  }

  const timeKeys: Array<[string, string]> = [
    ['DateTimeOriginal', 'Date taken'],
    ['ModifyDate', 'Last modified'],
    ['CreateDate', 'Created'],
  ]
  for (const [key, label] of timeKeys) {
    const field = createField(
      key,
      label,
      'time',
      formatDate(raw[key]),
      { hint: 'Embedded capture timestamp' },
    )
    if (field) fields.push(field)
  }

  const software = createField('software', 'Editing software', 'software', asString(raw.Software))
  if (software) fields.push(software)

  const width = raw.ImageWidth ?? raw.ExifImageWidth ?? raw.width
  const height = raw.ImageHeight ?? raw.ExifImageHeight ?? raw.height
  if (width != null && height != null) {
    const dim = createField(
      'dimensions',
      'Dimensions',
      'technical',
      `${width} × ${height} px`,
    )
    if (dim) fields.push(dim)
  }

  const orientation = asString(raw.Orientation)
  if (orientation) {
    const field = createField('orientation', 'Orientation', 'technical', orientation)
    if (field) fields.push(field)
  }

  return fields
}
