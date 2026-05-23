import { describe, expect, it, vi } from 'vitest'
import { createSampleImage, createSamplePdf } from './samples'

describe('Sample Generation', () => {
  describe('createSampleImage', () => {
    it('generates a sample JPEG image file successfully', async () => {
      // Mock document.createElement('canvas') for the test environment
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: () => ({
          createLinearGradient: () => ({ addColorStop: vi.fn() }),
          fillRect: vi.fn(),
          fillText: vi.fn(),
          fillStyle: '',
          font: '',
        }),
        toBlob: (cb: (blob: Blob | null) => void) => {
          // A tiny 1x1 black JPEG base64:
          const base64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
          const binary = atob(base64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          const blob = new Blob([bytes], { type: 'image/jpeg' })
          cb(blob)
        }
      }
      
      const spy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') return mockCanvas as any
        return {} as any
      })

      const file = await createSampleImage()
      expect(file).toBeDefined()
      expect(file.name).toBe('sample-photo.jpg')
      expect(file.type).toBe('image/jpeg')
      expect(file.size).toBeGreaterThan(0)

      spy.mockRestore()
    })
  })

  describe('createSamplePdf', () => {
    it('generates a sample PDF file successfully', async () => {
      const file = await createSamplePdf()
      expect(file).toBeDefined()
      expect(file.name).toBe('sample-report.pdf')
      expect(file.type).toBe('application/pdf')
      expect(file.size).toBeGreaterThan(0)
    })
  })
})
