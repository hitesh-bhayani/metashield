# MetaShield

Inspect, edit, and export metadata for **images** and **PDFs** — entirely in your browser. Nothing is uploaded to a server.

**Live demo:** [hitesh-bhayani.github.io/metashield](https://hitesh-bhayani.github.io/metashield/)

Part of a 30-day frontend challenge (Day 3 rebuild).

## Features

- **Metadata report** — fields grouped by type (location, identity, device, time, software, technical)
- **Editable fields** — change PDF title/author/subject/keywords/creator/producer; edit JPEG EXIF text tags
- **Clean all & download** — one button to wipe editable values, remove GPS, strip metadata, and export
- **Sample files** — try a demo photo (GPS + EXIF) or PDF at the bottom without uploading your own file
- **Recent activity** — local history of scanned/exported files (metadata summaries only, up to 30 entries)
- **Privacy toggles** — remove GPS from JPEG; strip all metadata via re-encode
- **Read-only clarity** — device, timestamps, and dimensions shown but not faked as editable

## Supported files

| Type | Read | Edit text metadata | Remove GPS | Strip all |
|------|------|--------------------|------------|-----------|
| JPEG | Yes | Yes | Yes | Yes (re-encode) |
| PNG / WebP / GIF | Yes | Limited | If present | Yes (re-encode) |
| PDF | Yes | Yes | — | Yes (clear info dict) |

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- [exifr](https://github.com/MikeKovarik/exifr) — image metadata
- [piexifjs](https://github.com/hMatoba/piexifjs) — JPEG EXIF write
- [pdf-lib](https://pdf-lib.js.org/) — PDF metadata
- Vitest + Testing Library

## Development

```bash
npm install
npm run dev      # open http://localhost:5173/  (not /metashield/ in dev)
npm test
npm run build
npm run preview  # open http://localhost:4173/metashield/
```

## Privacy

All parsing and export run locally in your browser using the File API. No analytics or upload endpoints are included.

---

Built by [hitesh-bhayani](https://github.com/hitesh-bhayani)
