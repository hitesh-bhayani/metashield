import { describe, expect, it } from 'vitest'
import { buildCleanAllState } from './clean'
import type { ParsedFileMetadata } from '../types/metadata'

const mockParsed: ParsedFileMetadata = {
  kind: 'image',
  fileName: 'x.jpg',
  fileSize: 100,
  mimeType: 'image/jpeg',
  supportsGpsRemoval: true,
  supportsExifEdit: true,
  fields: [
    {
      id: 'artist',
      label: 'Artist',
      category: 'identity',
      value: 'Jane',
      originalValue: 'Jane',
      editable: true,
    },
    {
      id: 'make',
      label: 'Make',
      category: 'device',
      value: 'Canon',
      originalValue: 'Canon',
      editable: false,
    },
  ],
}

describe('buildCleanAllState', () => {
  it('clears editable fields and enables full strip', () => {
    const next = buildCleanAllState(mockParsed, {
      values: { artist: 'Jane' },
      removeGps: false,
      stripAllMetadata: false,
    })
    expect(next.values.artist).toBe('')
    expect(next.removeGps).toBe(true)
    expect(next.stripAllMetadata).toBe(true)
  })
})
