import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Text, useInput, useStdin } from 'ink';
import { unlinkSync, existsSync } from 'node:fs';
import { Frame, bodyRows, useTerminalSize, type Hint } from '../components/Frame.tsx';
import { Select } from '../components/Select.tsx';
import { Checklist } from '../components/Checklist.tsx';
import { LineInput } from '../components/LineInput.tsx';
import { MultilineInput } from '../components/MultilineInput.tsx';
import { DateInput } from '../components/DateInput.tsx';
import { JsonPane } from '../components/JsonPane.tsx';
import { ClaudeOverlay } from '../components/ClaudeOverlay.tsx';
import { buildDraft, effectiveSlug, fieldsFor, storeInput, validateInput, type Draft, type FieldDef, type FlowContext, type Values } from '../lib/flows.ts';
import { serialize, writeJson } from '../lib/files.ts';
import { formatUtc } from '../lib/dates.ts';
import { localZone, utcToWall } from '../lib/zoned.ts';
import { editInExternalEditor } from '../lib/editor.ts';
import { relative } from 'node:path';
import { REPO_ROOT } from '../lib/paths.ts';

export type Message = { text: string; tone: 'info' | 'error' | 'success' } | null;

interface Props {
  ctx: FlowContext;
  values: Values;
  onValuesChange: (values: Values) => void;
  onPublish: (draft: Draft) => void;
  onBack: () => void;
  /** Starts the dev server if needed and opens the draft in the browser. */
  onPreview: (draft: Draft) => Promise<string>;
  /** Reports the path of the draft currently on disk (or null once removed). */
  onDraftWritten: (path: string | null) => void;
}

const LABEL_WIDTH = 12;

const summarize = (field: FieldDef, values: Values): { text: string; dim: boolean } => {
  const value = values[field.id];
  if (field.id === 'slug') {
    const slug = effectiveSlug(values);
    return slug ? { text: slug, dim: !values.slug } : { text: field.placeholder ?? '', dim: true };
  }
  switch (field.type) {
    case 'select':
      return { text: field.options?.find((o) => o.id === value)?.label ?? String(value), dim: false };
    case 'multiselect': {
      const ids = value as string[];
      return ids.length
        ? { text: ids.map((id) => field.options?.find((o) => o.id === id)?.label ?? id).join(', '), dim: false }
        : { text: 'none selected', dim: true };
    }
    case 'date': {
      const date = new Date(value as string);
      const zone = localZone();
      if (zone === 'UTC') return { text: formatUtc(date), dim: false };
      const w = utcToWall(date, zone);
      const local = `${String(w.hour).padStart(2, '0')}:${String(w.minute).padStart(2, '0')} ${zone}`;
      return { text: `${formatUtc(date)}  (${local})`, dim: false };
    }
    case 'multiline': {
      const text = (value as string).trim();
      if (!text) return { text: field.placeholder ?? '', dim: true };
      const lines = text.split('\n');
      return { text: lines.length > 1 ? `${lines[0]}  (+${lines.length - 1} lines)` : lines[0], dim: false };
    }
    default:
      return (value as string) ? { text: value as string, dim: false } : { text: field.placeholder ?? '', dim: true };
  }
};

/** Prefills the line editor for a field. */
const editText = (field: FieldDef, values: Values): string => {
  const value = values[field.id] as string;
  if (field.type === 'date') return formatUtc(new Date(value)).replace(' UTC', '');
  if (field.id === 'slug') return effectiveSlug(values);
  return value;
};

/** The two-pane editor used by all four flows. */
export const Form = ({ ctx, values, onValuesChange, onPublish, onBack, onPreview, onDraftWritten }: Props) => {
  const fields = useMemo(() => fieldsFor(ctx), [ctx]);
  const [focus, setFocus] = useState(0);
  const [editing, setEditing] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<'claude' | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [busy, setBusy] = useState(false);
  const { rows } = useTerminalSize();
  const { stdin, setRawMode } = useStdin();

  const field = fields[focus];
  const { draft, errors } = useMemo(() => buildDraft(ctx, values), [ctx, values]);
  const json = draft ? serialize(draft.file) : '{\n  // fill in the title to see the file\n}\n';

  // Keep the draft on disk so the browser preview and the publish step see it.
  const written = useRef<string | null>(null);
  const editStart = useRef<string | string[] | undefined>(undefined);
  useEffect(() => {
    if (!draft) return;
    const timer = setTimeout(() => {
      if (written.current && written.current !== draft.path && existsSync(written.current)) {
        unlinkSync(written.current);
      }
      writeJson(draft.path, draft.file);
      written.current = draft.path;
      onDraftWritten(draft.path);
    }, 300);
    return () => clearTimeout(timer);
  }, [draft, json]);

  const setValue = (id: string, value: string | string[]) => onValuesChange({ ...values, [id]: value });

  const commitText = (text: string) => {
    const error = validateInput(field, text);
    if (error) {
      setInputError(error);
      return;
    }
    setValue(field.id, storeInput(field, text));
    setInputError(null);
    setEditing(false);
  };

  const flushDraft = () => {
    if (!draft) return;
    writeJson(draft.path, draft.file);
    written.current = draft.path;
    onDraftWritten(draft.path);
  };

  const preview = async () => {
    if (!draft) {
      setMessage({ text: 'Fill in the title first, then Ctrl+P opens the preview', tone: 'error' });
      return;
    }
    flushDraft();
    setBusy(true);
    setMessage({ text: 'Starting the dev server…', tone: 'info' });
    try {
      setMessage({ text: await onPreview(draft), tone: 'success' });
    } catch (err) {
      setMessage({ text: (err as Error).message, tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const openEditor = () => {
    setRawMode(false);
    stdin.pause();
    process.stdout.write('\x1b[?1049l');
    const result = editInExternalEditor(values.message as string);
    process.stdout.write('\x1b[?1049h\x1b[2J\x1b[H');
    stdin.resume();
    setRawMode(true);
    if (result.ok) {
      setValue('message', result.text);
      setMessage({ text: 'Message updated from the editor', tone: 'success' });
    } else {
      setMessage({ text: result.error, tone: 'error' });
    }
  };

  const goPublish = () => {
    if (!draft || errors.length) {
      setMessage({ text: `Cannot publish yet: ${errors.join('; ')}`, tone: 'error' });
      return;
    }
    flushDraft();
    onPublish(draft);
  };

  // Hotkeys work in every mode except while an overlay is open.
  useInput(
    (input, key) => {
      if (!key.ctrl) return;
      if (input === 'p' && !busy) preview();
      if (input === 'g') setOverlay('claude');
      if (input === 'e') openEditor();
      if (input === 's') goPublish();
    },
    { isActive: overlay === null },
  );

  // Navigation, active only when nothing is being edited.
  useInput(
    (_input, key) => {
      if (key.tab && key.shift) setFocus((f) => (f - 1 + fields.length) % fields.length);
      else if (key.tab || key.downArrow) setFocus((f) => (f + 1) % fields.length);
      else if (key.upArrow) setFocus((f) => (f - 1 + fields.length) % fields.length);
      else if (key.return && !field.locked) {
        setInputError(null);
        editStart.current = values[field.id];
        setEditing(true);
      } else if (key.escape) onBack();
    },
    { isActive: !editing && overlay === null },
  );

  const editorActive = editing && overlay === null;
  // The date picker needs the whole width; the JSON pane returns when it closes.
  const wide = editing && field.type === 'date';
  const body = bodyRows(rows);
  const editorHeight = Math.max(3, body - fields.length - 4);

  const renderEditor = () => {
    if (!editing) return null;
    switch (field.type) {
      case 'select':
        return <Select options={field.options!} value={values[field.id] as string} onSubmit={(id) => { setValue(field.id, id); setEditing(false); }} onCancel={() => setEditing(false)} isActive={editorActive} />;
      case 'multiselect':
        return <Checklist options={field.options!} value={values[field.id] as string[]} onSubmit={(ids) => { setValue(field.id, ids); setEditing(false); }} onCancel={() => setEditing(false)} isActive={editorActive} />;
      case 'multiline':
        return <MultilineInput value={values[field.id] as string} height={editorHeight} onChange={(text) => setValue(field.id, text)} onSubmit={() => setEditing(false)} isActive={editorActive} />;
      case 'date':
        return (
          <DateInput
            value={values[field.id] as string}
            onChange={(iso) => setValue(field.id, iso)}
            onSubmit={(iso) => { setValue(field.id, iso); setEditing(false); }}
            onCancel={() => setEditing(false)}
            isActive={editorActive}
          />
        );
      default:
        return (
          <LineInput
            value={editText(field, values)}
            error={inputError}
            onChange={(text) => {
              // Keep the draft current while typing so Ctrl+P previews what is on screen.
              const error = validateInput(field, text);
              setInputError(error && text ? error : null);
              if (!error) setValue(field.id, storeInput(field, text));
            }}
            onSubmit={commitText}
            onCancel={() => {
              setInputError(null);
              if (editStart.current !== undefined) setValue(field.id, editStart.current);
              setEditing(false);
            }}
            isActive={editorActive}
          />
        );
    }
  };

  const previewHint: Hint = { key: 'Ctrl+P', label: 'preview' };
  const editingHints: Hint[] =
    field.type === 'multiline'
      ? [{ key: 'Esc', label: 'done' }, { key: 'Enter', label: 'newline' }, { key: 'Ctrl+G', label: 'Claude' }, { key: 'Ctrl+E', label: '$EDITOR' }]
      : field.type === 'date'
        ? [{ key: '←↑↓→', label: 'move' }, { key: 'Enter', label: 'open or pick' }, { key: 'Done', label: 'confirms' }, { key: 'Esc', label: 'cancel' }]
        : field.type === 'select' || field.type === 'multiselect'
          ? [{ key: '↑↓', label: 'move' }, ...(field.type === 'multiselect' ? [{ key: 'Space', label: 'toggle' }] : []), { key: 'Enter', label: 'confirm' }, { key: 'Esc', label: 'cancel' }]
          : [{ key: 'Enter', label: 'confirm' }, { key: 'Esc', label: 'cancel' }];
  const hints: Hint[] = editing
    ? [...editingHints, previewHint]
    : [{ key: 'Tab', label: 'next' }, { key: 'Enter', label: 'edit' }, previewHint, { key: 'Ctrl+G', label: 'Claude' }, { key: 'Ctrl+E', label: '$EDITOR' }, { key: 'Ctrl+S', label: 'publish' }, { key: 'Esc', label: 'back' }];

  const title =
    ctx.flow === 'new-incident' ? 'New incident' : ctx.flow === 'new-maintenance' ? 'New maintenance' : `${ctx.flow === 'update' ? 'Update' : 'Resolve'}: ${ctx.item?.name}`;

  return (
    <Frame title={title} hints={hints} message={message ?? (errors.length ? { text: `To publish: ${errors.join('; ')}`, tone: 'info' } : null)}>
      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column" width={wide ? '100%' : '50%'} paddingRight={1}>
          {fields.map((f, i) => {
            const focused = i === focus;
            const { text, dim } = summarize(f, values);
            return (
              <Box key={f.id} flexDirection="column">
                <Box>
                  <Box width={2} flexShrink={0}>
                    <Text color={focused ? 'cyan' : undefined}>{focused ? '›' : ' '}</Text>
                  </Box>
                  <Box width={LABEL_WIDTH} flexShrink={0}>
                    <Text bold={focused} color={focused ? 'cyan' : undefined}>{f.label}</Text>
                  </Box>
                  {focused && editing ? null : (
                    <Box flexGrow={1} flexShrink={1}>
                      <Text dimColor={dim || f.locked} wrap="truncate">{text}</Text>
                    </Box>
                  )}
                </Box>
                {focused && editing ? <Box marginLeft={f.type === 'date' ? 2 : 2 + LABEL_WIDTH}>{renderEditor()}</Box> : null}
              </Box>
            );
          })}
          {overlay === 'claude' ? (
            <Box marginTop={1}>
              <ClaudeOverlay
                text={values.message as string}
                onAccept={(text) => { setValue('message', text); setOverlay(null); setMessage({ text: 'Message replaced with Claude’s text', tone: 'success' }); }}
                onClose={() => setOverlay(null)}
              />
            </Box>
          ) : null}
        </Box>
        {wide ? null : (
          <Box flexDirection="column" width="50%">
            <JsonPane title={draft ? relative(REPO_ROOT, draft.path) : 'data/…'} json={json} height={body - 2} tail={ctx.flow === 'update' || ctx.flow === 'resolve'} />
          </Box>
        )}
      </Box>
    </Frame>
  );
};
