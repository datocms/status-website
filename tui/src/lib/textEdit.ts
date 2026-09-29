/** Pure text-editing core shared by the single-line and multi-line inputs. */

export interface EditState {
  value: string;
  cursor: number;
}

export interface EditKey {
  leftArrow?: boolean;
  rightArrow?: boolean;
  upArrow?: boolean;
  downArrow?: boolean;
  backspace?: boolean;
  delete?: boolean;
  return?: boolean;
  ctrl?: boolean;
  meta?: boolean;
}

const lineStart = (value: string, cursor: number) => value.lastIndexOf('\n', cursor - 1) + 1;
const lineEnd = (value: string, cursor: number) => {
  const next = value.indexOf('\n', cursor);
  return next === -1 ? value.length : next;
};

const moveVertically = (state: EditState, direction: -1 | 1): EditState => {
  const { value, cursor } = state;
  const start = lineStart(value, cursor);
  const column = cursor - start;
  if (direction === -1) {
    if (start === 0) return { value, cursor: 0 };
    const prevStart = lineStart(value, start - 1);
    return { value, cursor: Math.min(prevStart + column, start - 1) };
  }
  const end = lineEnd(value, cursor);
  if (end === value.length) return { value, cursor: value.length };
  const nextStart = end + 1;
  return { value, cursor: Math.min(nextStart + column, lineEnd(value, nextStart)) };
};

/**
 * Applies one keypress. `multiline` decides whether Enter inserts a newline.
 * Ctrl and Meta chords are ignored so the caller can use them as hotkeys.
 */
export const applyKey = (state: EditState, input: string, key: EditKey, multiline: boolean): EditState => {
  const { value, cursor } = state;
  if (key.ctrl || key.meta) return state;

  if (key.leftArrow) return { value, cursor: Math.max(0, cursor - 1) };
  if (key.rightArrow) return { value, cursor: Math.min(value.length, cursor + 1) };
  if (key.upArrow) return multiline ? moveVertically(state, -1) : state;
  if (key.downArrow) return multiline ? moveVertically(state, 1) : state;

  if (key.backspace || key.delete) {
    if (cursor === 0) return state;
    return { value: value.slice(0, cursor - 1) + value.slice(cursor), cursor: cursor - 1 };
  }

  if (key.return) {
    if (!multiline) return state;
    return insert(state, '\n');
  }

  if (!input) return state;
  // Pasted text arrives as one chunk; normalize line endings and drop control chars.
  const clean = input.replace(/\r\n?/g, '\n').replace(/[^\n\P{Cc}]/gu, '');
  if (!clean) return state;
  return insert(state, multiline ? clean : clean.replace(/\n/g, ' '));
};

const insert = ({ value, cursor }: EditState, text: string): EditState => ({
  value: value.slice(0, cursor) + text + value.slice(cursor),
  cursor: cursor + text.length,
});

/** Lines with the cursor position expressed as (row, column). */
export const cursorPosition = ({ value, cursor }: EditState) => {
  const before = value.slice(0, cursor);
  const row = (before.match(/\n/g) ?? []).length;
  const column = cursor - lineStart(value, cursor);
  return { row, column, lines: value.split('\n') };
};
