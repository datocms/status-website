import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyKey, cursorPosition } from '../src/lib/textEdit.ts';

const type = (value: string, cursor: number, input: string, multiline = true) =>
  applyKey({ value, cursor }, input, {}, multiline);

test('typing inserts at the cursor', () => {
  assert.deepEqual(type('ac', 1, 'b'), { value: 'abc', cursor: 2 });
});

test('pasted text keeps newlines in multiline and flattens them in single-line', () => {
  assert.deepEqual(type('', 0, 'a\r\nb'), { value: 'a\nb', cursor: 3 });
  assert.deepEqual(type('', 0, 'a\r\nb', false), { value: 'a b', cursor: 3 });
});

test('backspace and delete both remove before the cursor', () => {
  assert.deepEqual(applyKey({ value: 'abc', cursor: 2 }, '', { backspace: true }, true), { value: 'ac', cursor: 1 });
  assert.deepEqual(applyKey({ value: 'abc', cursor: 2 }, '', { delete: true }, true), { value: 'ac', cursor: 1 });
  assert.deepEqual(applyKey({ value: 'abc', cursor: 0 }, '', { backspace: true }, true), { value: 'abc', cursor: 0 });
});

test('enter inserts a newline only in multiline mode', () => {
  assert.deepEqual(applyKey({ value: 'ab', cursor: 1 }, '', { return: true }, true), { value: 'a\nb', cursor: 2 });
  const single = { value: 'ab', cursor: 1 };
  assert.equal(applyKey(single, '', { return: true }, false), single);
});

test('ctrl and meta chords are ignored', () => {
  const state = { value: 'ab', cursor: 1 };
  assert.equal(applyKey(state, 'p', { ctrl: true }, true), state);
  assert.equal(applyKey(state, 'p', { meta: true }, true), state);
});

test('arrows move within bounds and across lines', () => {
  const state = { value: 'hello\nhi\nworld', cursor: 3 };
  assert.equal(applyKey(state, '', { leftArrow: true }, true).cursor, 2);
  assert.equal(applyKey({ value: 'ab', cursor: 2 }, '', { rightArrow: true }, true).cursor, 2);
  // Down from column 3 of "hello" lands at the end of "hi".
  assert.equal(applyKey(state, '', { downArrow: true }, true).cursor, 8);
  // Up from "world" column 2 lands on "hi" column 2.
  assert.equal(applyKey({ value: 'hello\nhi\nworld', cursor: 11 }, '', { upArrow: true }, true).cursor, 8);
  // Up on the first line goes to the start; down on the last goes to the end.
  assert.equal(applyKey(state, '', { upArrow: true }, true).cursor, 0);
  assert.equal(applyKey({ value: 'a\nb', cursor: 2 }, '', { downArrow: true }, true).cursor, 3);
});

test('cursorPosition reports row, column, and lines', () => {
  assert.deepEqual(cursorPosition({ value: 'ab\ncd', cursor: 4 }), { row: 1, column: 1, lines: ['ab', 'cd'] });
});
