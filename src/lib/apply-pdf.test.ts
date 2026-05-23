import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { applyPdfChanges } from './apply-pdf'

async function makeSamplePdf() {
  const doc = await PDFDocument.create()
  doc.addPage()
  doc.setTitle('Secret draft')
  doc.setAuthor('Old Author')
  doc.setSubject('Internal')
  const bytes = await doc.save()
  return new File([bytes as BlobPart], 'sample.pdf', { type: 'application/pdf' })
}

describe('applyPdfChanges', () => {
  it('updates editable PDF metadata fields', async () => {
    const file = await makeSamplePdf()
    const blob = await applyPdfChanges(file, {
      values: {
        title: 'Public version',
        author: 'New Author',
        subject: '',
        keywords: 'report, 2024',
        creator: 'MetaShield',
        producer: 'MetaShield',
      },
      removeGps: false,
      stripAllMetadata: false,
    })

    const updated = await PDFDocument.load(await blob.arrayBuffer())
    expect(updated.getTitle()).toBe('Public version')
    expect(updated.getAuthor()).toBe('New Author')
    expect(updated.getSubject()).toBe('')
    const keywords = updated.getKeywords()
    expect(String(keywords)).toMatch(/report/)
    expect(String(keywords)).toMatch(/2024/)
    expect(updated.getCreator()).toBe('MetaShield')
  })

  it('clears all standard fields when stripAllMetadata is true', async () => {
    const file = await makeSamplePdf()
    const blob = await applyPdfChanges(file, {
      values: { title: 'Kept briefly' },
      removeGps: false,
      stripAllMetadata: true,
    })

    const updated = await PDFDocument.load(await blob.arrayBuffer())
    expect(updated.getTitle()).toBe('')
    expect(updated.getAuthor()).toBe('')
    expect(updated.getSubject()).toBe('')
  })
})
