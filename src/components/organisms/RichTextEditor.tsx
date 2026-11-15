'use client';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { BackgroundColor, Color, TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api/client';
import s from './RichTextEditor.module.css';

/** Plain text / Markdown saved before the editor existed → simple HTML so it opens nicely. */
function toHtml(value: string | null | undefined): string {
  const v = String(value ?? '').trim();
  if (!v) return '';
  if (/<\/?[a-z][\s\S]*>/i.test(v)) return v;
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (t: string) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2">$1</a>');
  return v.replace(/\r/g, '').split(/\n{2,}/).map((block) => {
    const lines = block.split('\n');
    const h = /^(#{1,4})\s+(.*)$/.exec(block);
    if (h && lines.length === 1) return `<h${Math.max(2, h[1].length)}>${inline(h[2])}</h${Math.max(2, h[1].length)}>`;
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`;
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
    if (lines.every((l) => /^>\s?/.test(l))) return `<blockquote><p>${lines.map((l) => inline(l.replace(/^>\s?/, ''))).join('<br>')}</p></blockquote>`;
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

const COLORS = ['#2a201b', '#9d613d', '#c6a15b', '#be123c', '#d97706', '#15803d', '#0d9488', '#0284c7', '#4f46e5', '#7c3aed', '#6f6259'];
const HIGHLIGHTS = ['#fef3c7', '#dcfce7', '#ccfbf1', '#e0f2fe', '#e0e7ff', '#ffe4e6', '#f6e9dc'];

function Btn({ on, title, active, disabled, children }: { on: () => void; title: string; active?: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" className={s.btn} data-active={active || undefined} disabled={disabled} title={title} aria-label={title} aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()} onClick={on}>{children}</button>
  );
}
const Sep = () => <span className={s.sep} aria-hidden />;

function Swatches({ label, colors, onPick, onClear, current }: { label: string; colors: string[]; onPick: (c: string) => void; onClear: () => void; current?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className={s.pop} ref={ref}>
      <button type="button" className={s.btn} title={label} aria-label={label} aria-expanded={open} onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen((v) => !v)}>
        {label === 'Text colour' ? <span style={{ fontWeight: 700, borderBottom: `3px solid ${current ?? '#2a201b'}`, lineHeight: 1 }}>A</span> : <span style={{ background: current ?? '#fef3c7', padding: '0 4px', borderRadius: 3, fontWeight: 700 }}>H</span>}
      </button>
      {open && (
        <div className={s.swatches} role="menu" aria-label={label}>
          {colors.map((c) => <button key={c} type="button" role="menuitem" className={s.swatch} style={{ background: c }} title={c} aria-label={c} onMouseDown={(e) => e.preventDefault()} onClick={() => { onPick(c); setOpen(false); }} />)}
          <button type="button" role="menuitem" className={s.clear} onMouseDown={(e) => e.preventDefault()} onClick={() => { onClear(); setOpen(false); }}>None</button>
        </div>
      )}
    </div>
  );
}

function Toolbar({ editor, source, setSource, folder }: { editor: Editor; source: boolean; setSource: (v: boolean) => void; folder: string }) {
  const st = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'),
      code: e.isActive('code'), sub: e.isActive('subscript'), sup: e.isActive('superscript'), link: e.isActive('link'),
      bullet: e.isActive('bulletList'), ordered: e.isActive('orderedList'), task: e.isActive('taskList'), quote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'), table: e.isActive('table'),
      block: e.isActive('heading', { level: 2 }) ? 'h2' : e.isActive('heading', { level: 3 }) ? 'h3' : e.isActive('heading', { level: 4 }) ? 'h4' : 'p',
      align: (['left', 'center', 'right', 'justify'] as const).find((a) => e.isActive({ textAlign: a })) ?? 'left',
      color: e.getAttributes('textStyle').color as string | undefined, mark: e.getAttributes('highlight').color as string | undefined,
      canUndo: e.can().undo(), canRedo: e.can().redo(),
    }),
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const c = () => editor.chain().focus();

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL (https://… or /page). Leave empty to remove.', prev ?? 'https://');
    if (url === null) return;
    if (!url.trim()) return void c().extendMarkRange('link').unsetLink().run();
    c().extendMarkRange('link').setLink({ href: url.trim(), target: /^https?:/.test(url) ? '_blank' : null }).run();
  };
  const imageFromUrl = () => {
    const url = window.prompt('Image URL (https://…)');
    if (url?.trim()) c().setImage({ src: url.trim(), alt: window.prompt('Alt text (describe the image)') ?? '' }).run();
  };
  const upload = async (files: FileList | null) => {
    const f = files?.[0]; if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', f); fd.append('folder', folder);
      const m = await apiFetch<{ url: string }>('media', { formData: fd });
      c().setImage({ src: m.url, alt: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ') }).run();
    } catch (e: any) { alert(e.message ?? 'Upload failed'); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  if (source) {
    return (
      <div className={s.toolbar}>
        <span className={s.sourceLabel}>HTML source</span>
        <Btn on={() => setSource(false)} title="Back to editor" active>Visual editor</Btn>
      </div>
    );
  }
  return (
    <div className={s.toolbar} role="toolbar" aria-label="Formatting">
      <Btn on={() => c().undo().run()} title="Undo" disabled={!st.canUndo}>↶</Btn>
      <Btn on={() => c().redo().run()} title="Redo" disabled={!st.canRedo}>↷</Btn>
      <Sep />
      <select className={s.select} aria-label="Text style" value={st.block} onChange={(e) => {
        const v = e.target.value;
        if (v === 'p') c().setParagraph().run(); else c().setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
      }}>
        <option value="p">Paragraph</option><option value="h2">Heading 1</option><option value="h3">Heading 2</option><option value="h4">Heading 3</option>
      </select>
      <Sep />
      <Btn on={() => c().toggleBold().run()} title="Bold (⌘B)" active={st.bold}><b>B</b></Btn>
      <Btn on={() => c().toggleItalic().run()} title="Italic (⌘I)" active={st.italic}><i>I</i></Btn>
      <Btn on={() => c().toggleUnderline().run()} title="Underline (⌘U)" active={st.underline}><u>U</u></Btn>
      <Btn on={() => c().toggleStrike().run()} title="Strikethrough" active={st.strike}><s>S</s></Btn>
      <Btn on={() => c().toggleSubscript().run()} title="Subscript" active={st.sub}>X<sub>2</sub></Btn>
      <Btn on={() => c().toggleSuperscript().run()} title="Superscript" active={st.sup}>X<sup>2</sup></Btn>
      <Btn on={() => c().toggleCode().run()} title="Inline code" active={st.code}>{'</>'}</Btn>
      <Sep />
      <Swatches label="Text colour" colors={COLORS} current={st.color} onPick={(col) => c().setColor(col).run()} onClear={() => c().unsetColor().run()} />
      <Swatches label="Highlight" colors={HIGHLIGHTS} current={st.mark} onPick={(col) => c().setHighlight({ color: col }).run()} onClear={() => c().unsetHighlight().run()} />
      <Sep />
      {(['left', 'center', 'right', 'justify'] as const).map((a) => (
        <Btn key={a} on={() => c().setTextAlign(a).run()} title={`Align ${a}`} active={st.align === a}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            {a === 'left' && <><path d="M2 3h12" /><path d="M2 6.5h8" /><path d="M2 10h12" /><path d="M2 13.5h8" /></>}
            {a === 'center' && <><path d="M2 3h12" /><path d="M4 6.5h8" /><path d="M2 10h12" /><path d="M4 13.5h8" /></>}
            {a === 'right' && <><path d="M2 3h12" /><path d="M6 6.5h8" /><path d="M2 10h12" /><path d="M6 13.5h8" /></>}
            {a === 'justify' && <><path d="M2 3h12" /><path d="M2 6.5h12" /><path d="M2 10h12" /><path d="M2 13.5h12" /></>}
          </g></svg>
        </Btn>
      ))}
      <Sep />
      <Btn on={() => c().toggleBulletList().run()} title="Bulleted list" active={st.bullet}>•≡</Btn>
      <Btn on={() => c().toggleOrderedList().run()} title="Numbered list" active={st.ordered}>1≡</Btn>
      <Btn on={() => c().toggleTaskList().run()} title="Checklist" active={st.task}>☑</Btn>
      <Btn on={() => c().toggleBlockquote().run()} title="Quote" active={st.quote}>❝</Btn>
      <Btn on={() => c().toggleCodeBlock().run()} title="Code block" active={st.codeBlock}>{'{ }'}</Btn>
      <Btn on={() => c().setHorizontalRule().run()} title="Divider line">―</Btn>
      <Sep />
      <Btn on={setLink} title={st.link ? 'Edit / remove link' : 'Add link'} active={st.link}>🔗</Btn>
      <Btn on={() => fileRef.current?.click()} title="Upload image" disabled={uploading}>{uploading ? '…' : '🖼'}</Btn>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => upload(e.target.files)} />
      <Btn on={imageFromUrl} title="Image from URL">🌐</Btn>
      <Btn on={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table" active={st.table}>▦</Btn>
      {st.table && (
        <>
          <Btn on={() => c().addRowAfter().run()} title="Add row">+R</Btn>
          <Btn on={() => c().addColumnAfter().run()} title="Add column">+C</Btn>
          <Btn on={() => c().deleteRow().run()} title="Delete row">−R</Btn>
          <Btn on={() => c().deleteColumn().run()} title="Delete column">−C</Btn>
          <Btn on={() => c().deleteTable().run()} title="Delete table">✕▦</Btn>
        </>
      )}
      <Sep />
      <Btn on={() => c().unsetAllMarks().clearNodes().run()} title="Clear formatting">⌫</Btn>
      <Btn on={() => setSource(true)} title="Edit HTML source">HTML</Btn>
    </div>
  );
}

/**
 * Rich text editor (TipTap) used for every description / content field in the admin.
 * Value in/out is HTML; existing plain text or Markdown is converted when opened.
 */
export function RichTextEditor({ id, value, onChange, placeholder, folder = 'general', minHeight = 220 }: {
  id?: string; value: string | null | undefined; onChange: (html: string) => void; placeholder?: string; folder?: string; minHeight?: number;
}) {
  const [source, setSource] = useState(false);
  const [html, setHtml] = useState(() => toHtml(value));
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true, defaultProtocol: 'https' } }),
      TextStyle, Color, BackgroundColor, Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Subscript, Superscript, TaskList, TaskItem.configure({ nested: true }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
      CharacterCount,
    ],
    content: html,
    editorProps: { attributes: { class: s.content, ...(id ? { id } : {}), style: `min-height:${minHeight}px` } },
    onUpdate: ({ editor: e }) => { const out = e.isEmpty ? '' : e.getHTML(); setHtml(out); onChange(out); },
  });
  const counts = useEditorState({ editor, selector: ({ editor: e }) => ({ words: e?.storage.characterCount?.words?.() ?? 0, chars: e?.storage.characterCount?.characters?.() ?? 0 }) });

  return (
    <div className={s.wrap}>
      {editor && <Toolbar editor={editor} source={source} setSource={(v) => { if (!v) editor.commands.setContent(html, { emitUpdate: false }); setSource(v); }} folder={folder} />}
      {source
        ? <textarea className={s.source} value={html} spellCheck={false} aria-label="HTML source" style={{ minHeight }} onChange={(e) => { setHtml(e.target.value); onChange(e.target.value); }} />
        : <EditorContent editor={editor} />}
      <div className={s.foot}>{counts?.words ?? 0} words · {counts?.chars ?? 0} characters</div>
    </div>
  );
}
