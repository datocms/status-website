import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { diffLines } from 'diff';
import { run, type Runner } from './proc.ts';
import { REPO_ROOT } from './paths.ts';

export interface Version {
  sha: string;
  date: Date;
  subject: string;
  author: string;
}

const SEP = '\x1f';

/** Parses `git log` output produced with the format used by `fileHistory`. */
export const parseLog = (stdout: string): Version[] =>
  stdout
    .split('\n')
    .filter((line) => line.includes(SEP))
    .map((line) => {
      const [sha, seconds, author, subject] = line.split(SEP);
      return { sha, date: new Date(Number(seconds) * 1000), subject, author };
    });

/** Every committed version of a file, newest first. */
export const fileHistory = async (file: string, cwd = REPO_ROOT, runner: Runner = run): Promise<Version[]> => {
  const result = await runner('git', ['log', `--format=%H${SEP}%ct${SEP}%an${SEP}%s`, '--', relative(cwd, file)], { cwd });
  return result.code === 0 ? parseLog(result.stdout) : [];
};

/** File content at a commit. */
export const fileAtVersion = async (file: string, sha: string, cwd = REPO_ROOT, runner: Runner = run) => {
  const result = await runner('git', ['show', `${sha}:${relative(cwd, file)}`], { cwd });
  if (result.code !== 0) throw new Error(result.stderr.trim() || `git show failed for ${sha}`);
  return result.stdout;
};

export const currentContent = (file: string) => readFileSync(file, 'utf8');

export type RowKind = 'same' | 'removed' | 'added' | 'changed';

export interface DiffRow {
  left: string | null;
  right: string | null;
  kind: RowKind;
}

const lines = (text: string) => (text.endsWith('\n') ? text.slice(0, -1) : text).split('\n');

/**
 * Line-aligned side-by-side rows. A removed block followed by an added block
 * is paired row by row as `changed`; leftovers fall back to one-sided rows.
 */
export const sideBySide = (oldText: string, newText: string): DiffRow[] => {
  const rows: DiffRow[] = [];
  const parts = diffLines(oldText, newText);

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (!part.added && !part.removed) {
      for (const line of lines(part.value)) rows.push({ left: line, right: line, kind: 'same' });
      continue;
    }
    if (part.removed) {
      const removed = lines(part.value);
      const next = parts[i + 1];
      const added = next?.added ? lines(next.value) : [];
      if (next?.added) i += 1;
      const count = Math.max(removed.length, added.length);
      for (let r = 0; r < count; r += 1) {
        const left = removed[r] ?? null;
        const right = added[r] ?? null;
        rows.push({ left, right, kind: left !== null && right !== null ? 'changed' : left !== null ? 'removed' : 'added' });
      }
      continue;
    }
    for (const line of lines(part.value)) rows.push({ left: null, right: line, kind: 'added' });
  }
  return rows;
};

/** Index of the first row that differs, so the view can open on the change. */
export const firstChange = (rows: DiffRow[]) => Math.max(0, rows.findIndex((r) => r.kind !== 'same'));
