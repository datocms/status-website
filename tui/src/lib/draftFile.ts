/**
 * The form writes its draft to the real path in data/, so that the preview
 * can show it. This decides if a write is safe.
 */

export interface DraftWrite {
  /** Where the draft goes now. */
  path: string;
  /** The file that this form made before, or null. */
  owned: string | null;
  /** A new incident or maintenance. An update writes to the file of its item. */
  isNewFile: boolean;
  exists: (path: string) => boolean;
}

export interface DraftPlan {
  /** `collision`: another item has this file. Write nothing. */
  action: 'write' | 'collision';
  /** The file of the old name, which this form made and must remove. */
  remove: string | null;
}

export const planDraftWrite = ({ path, owned, isNewFile, exists }: DraftWrite): DraftPlan => {
  if (!isNewFile || path === owned) return { action: 'write', remove: null };

  // The name changed. A file that is there was not made by this form.
  if (exists(path)) return { action: 'collision', remove: null };

  return { action: 'write', remove: owned };
};
