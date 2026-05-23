import type { EditorState, ParsedFileMetadata } from '../types/metadata'

/** Editor preset: wipe editable values + strip everything on export. */
export function buildCleanAllState(
  parsed: ParsedFileMetadata,
  editor: EditorState,
): EditorState {
  const values = { ...editor.values }
  for (const field of parsed.fields) {
    if (field.editable) values[field.id] = ''
  }
  return {
    values,
    removeGps: parsed.supportsGpsRemoval || editor.removeGps,
    stripAllMetadata: true,
  }
}
