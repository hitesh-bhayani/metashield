import { describe, expect, it } from 'vitest'
import {
  buildEditorState,
  createField,
  fieldsFromExifRaw,
  groupFieldsByCategory,
} from './fields'
import { formatGps } from './format'

describe('formatGps', () => {
  it('formats coordinates with hemisphere', () => {
    expect(formatGps(37.7749, -122.4194)).toBe(
      '37.774900° N, 122.419400° W',
    )
  })

  it('returns null for missing values', () => {
    expect(formatGps(undefined, 1)).toBeNull()
  })
})

describe('fieldsFromExifRaw', () => {
  it('maps EXIF blocks into grouped fields', () => {
    const fields = fieldsFromExifRaw({
      latitude: 12.9716,
      longitude: 77.5946,
      Make: 'Canon',
      Model: 'EOS R6',
      Artist: 'Jane Doe',
      ImageDescription: 'Team offsite',
      DateTimeOriginal: new Date('2024-06-01T10:00:00Z'),
      Software: 'Adobe Lightroom',
      ImageWidth: 4000,
      ImageHeight: 3000,
    })

    expect(fields.find((f) => f.id === 'gps')?.category).toBe('location')
    expect(fields.find((f) => f.id === 'artist')?.editable).toBe(true)
    expect(fields.find((f) => f.id === 'make')?.editable).toBe(false)
    expect(fields.find((f) => f.id === 'dimensions')?.value).toBe('4000 × 3000 px')
  })
})

describe('createField and editor state', () => {
  it('skips empty values', () => {
    expect(createField('x', 'X', 'other', null)).toBeNull()
  })

  it('builds editor values for editable fields only', () => {
    const fields = [
      createField('author', 'Author', 'identity', 'Alice', { editable: true })!,
      createField('make', 'Make', 'device', 'Sony')!,
    ]
    const editor = buildEditorState(fields)
    expect(editor.values).toEqual({ author: 'Alice' })
    expect(editor.removeGps).toBe(false)
  })
})

describe('groupFieldsByCategory', () => {
  it('groups fields by category', () => {
    const fields = [
      createField('a', 'A', 'identity', '1')!,
      createField('b', 'B', 'device', '2')!,
    ]
    const grouped = groupFieldsByCategory(fields)
    expect(grouped.get('identity')).toHaveLength(1)
    expect(grouped.get('device')).toHaveLength(1)
  })
})
