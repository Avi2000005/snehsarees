import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Minus,
  Undo2,
  Redo2,
  Code2,
  Eye,
  Sparkles,
  HelpCircle,
  X,
  Check
} from 'lucide-react';
import { normalizeDescriptionToHtml, sanitizeHtml, stripHtmlToPlainText } from '../utils/sanitizeHtml';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Describe the handloom weaving, fabric texture, zari border, motifs, and styling tips...',
  className = '',
}) => {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'text-[#C4601A] underline font-medium cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: normalizeDescriptionToHtml(value) || '',
    editorProps: {
      attributes: {
        class:
          'tiptap-prose focus:outline-none min-h-[140px] max-h-[420px] overflow-y-auto px-3.5 py-3 text-xs md:text-sm text-[#1A1A1A] leading-relaxed font-sans',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If editor only has an empty paragraph, send empty string
      if (html === '<p></p>' || html === '<p></p>\n') {
        onChange('');
      } else {
        onChange(html);
      }
    },
  });

  // Sync external value changes (e.g., when opening different products or resetting)
  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    const cleanValue = value ? normalizeDescriptionToHtml(value) : '';

    // Only update if difference is meaningful to prevent cursor jumps
    if (value !== currentHtml && cleanValue !== currentHtml) {
      if (!editor.isFocused) {
        editor.commands.setContent(cleanValue || '', { emitUpdate: false });
      }
    }
  }, [value, editor]);

  // When opening link dialog, prefill current link href if cursor is on link
  const openLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkDialog(true);
    setTimeout(() => {
      linkInputRef.current?.focus();
    }, 100);
  };

  const applyLink = () => {
    if (!editor) return;
    if (linkUrl.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl) && !/^tel:/i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
    }
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setShowLinkDialog(false);
    setLinkUrl('');
  };

  // Quick Saree Description Templates
  const insertTemplate = (type: 'sareeDetails' | 'careGuide' | 'bulletHighlights') => {
    if (!editor) return;

    if (type === 'sareeDetails') {
      const templateHtml = `
        <h2>Artisan Weave & Fabric Details</h2>
        <p>This authentic Kota Doria saree is handwoven by master craftspersons in Kota, Rajasthan. Crafted with signature transparent Khat square checks, shimmering pure zari borders, and lightweight breathable comfort.</p>
        <ul>
          <li><strong>Weave Type:</strong> Authentic Traditional Khat Handloom</li>
          <li><strong>Body Pattern:</strong> Fine Square Grid with delicate motifs</li>
          <li><strong>Pallu & Border:</strong> Rich Zari Embellished finish</li>
          <li><strong>Occasion:</strong> Weddings, Festivities & Traditional Celebrations</li>
        </ul>
      `;
      editor.chain().focus().insertContent(templateHtml).run();
    } else if (type === 'careGuide') {
      const templateHtml = `
        <h3>Handloom Fabric Care Instructions</h3>
        <ul>
          <li>Dry clean recommended for first few washes to preserve genuine zari luster.</li>
          <li>Avoid spraying perfume directly onto the zari and metallic threads.</li>
          <li>Store wrapped in soft muslin or cotton cloth in a cool, dry wardrobe.</li>
          <li>Iron inside-out on low to medium silk temperature setting.</li>
        </ul>
      `;
      editor.chain().focus().insertContent(templateHtml).run();
    } else if (type === 'bulletHighlights') {
      const templateHtml = `
        <ul>
          <li><strong>100% Authentic Handloom:</strong> Sourced directly from artisan weavers in Rajasthan.</li>
          <li><strong>Featherlight Drape:</strong> Airy, breathable, and effortlessly easy to carry all day.</li>
          <li><strong>Unstitched Blouse Piece:</strong> Included with matching woven border detail.</li>
        </ul>
      `;
      editor.chain().focus().insertContent(templateHtml).run();
    }
    setShowTemplates(false);
  };

  // Character and word count
  const plainText = stripHtmlToPlainText(value);
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = plainText.length;

  return (
    <div className={`rich-text-editor-container border border-[#E8E0D5] rounded-xl bg-white overflow-hidden shadow-xs transition-all focus-within:border-[#C4601A] ${className}`}>
      {/* ─── Top Toolbar ─── */}
      <div className="bg-[#FAF6F0] border-b border-[#E8E0D5] p-1.5 flex flex-wrap items-center gap-1 text-[#4A4A4A]">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-1 mr-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-1.5 rounded hover:bg-[#F2ECE1] disabled:opacity-30 disabled:hover:bg-transparent text-[#1A1A1A] transition-colors cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-1.5 rounded hover:bg-[#F2ECE1] disabled:opacity-30 disabled:hover:bg-transparent text-[#1A1A1A] transition-colors cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings & Paragraph */}
        <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-1 mr-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().setParagraph().run()}
            className={`p-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              editor?.isActive('paragraph') && !editor?.isActive('heading')
                ? 'bg-[#FFF0E8] text-[#C4601A] font-bold'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Normal Paragraph"
          >
            <Pilcrow className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">P</span>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              editor?.isActive('heading', { level: 2 })
                ? 'bg-[#FFF0E8] text-[#C4601A] font-bold'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Heading 2 (Section Title)"
          >
            <Heading2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">H2</span>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              editor?.isActive('heading', { level: 3 })
                ? 'bg-[#FFF0E8] text-[#C4601A] font-bold'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Heading 3 (Sub-heading)"
          >
            <Heading3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">H3</span>
          </button>
        </div>

        {/* Text Formatting: Bold, Italic, Underline, Strikethrough */}
        <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-1 mr-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive('bold')
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive('italic')
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive('underline')
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive('strike')
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists: Bullets & Numbered */}
        <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-1 mr-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive('bulletList')
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive('orderedList')
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-1 mr-0.5">
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive({ textAlign: 'left' })
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive({ textAlign: 'center' })
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive({ textAlign: 'right' })
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive({ textAlign: 'justify' })
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Justify Text"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Links & Divider */}
        <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-1 mr-0.5">
          <button
            type="button"
            onClick={openLinkModal}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor?.isActive('link')
                ? 'bg-[#FFF0E8] text-[#C4601A]'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title="Insert / Edit Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          {editor?.isActive('link') && (
            <button
              type="button"
              onClick={removeLink}
              className="p-1.5 rounded hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
              title="Remove Link"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded hover:bg-[#F2ECE1] text-[#4A4A4A] transition-colors cursor-pointer"
            title="Insert Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Saree Templates Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold text-[#C4601A] bg-[#FFF0E8] hover:bg-[#FDE2D2] border border-[#F0C8A0] transition-colors cursor-pointer"
            title="Insert pre-made saree templates"
          >
            <Sparkles className="w-3 h-3 text-[#C4601A]" />
            <span>Templates</span>
          </button>

          {showTemplates && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-[#E8E0D5] p-1.5 z-50 animate-scale-100">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2 py-1">
                Insert Quick Sections
              </div>
              <button
                type="button"
                onClick={() => insertTemplate('sareeDetails')}
                className="w-full text-left px-2 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#FAF6F0] rounded-lg font-medium transition-colors cursor-pointer block"
              >
                ✨ Weave &amp; Fabric Details
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('careGuide')}
                className="w-full text-left px-2 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#FAF6F0] rounded-lg font-medium transition-colors cursor-pointer block"
              >
                🧼 Fabric Care Instructions
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('bulletHighlights')}
                className="w-full text-left px-2 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#FAF6F0] rounded-lg font-medium transition-colors cursor-pointer block"
              >
                📌 Key Product Highlights
              </button>
            </div>
          )}
        </div>

        {/* Source Code View Toggle (HTML edit mode) */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setIsSourceMode(!isSourceMode);
              if (isSourceMode && editor) {
                editor.commands.setContent(value || '', { emitUpdate: false });
              }
            }}
            className={`p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold ${
              isSourceMode
                ? 'bg-[#1A1A1A] text-white'
                : 'hover:bg-[#F2ECE1] text-[#4A4A4A]'
            }`}
            title={isSourceMode ? 'Switch to Visual Editor' : 'Edit HTML Source Code'}
          >
            {isSourceMode ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSourceMode ? 'Visual' : 'HTML'}</span>
          </button>
        </div>
      </div>

      {/* ─── Inline Link Dialog ─── */}
      {showLinkDialog && (
        <div className="bg-[#FAF6F0] border-b border-[#E8E0D5] p-2 flex items-center gap-2 animate-fade-in">
          <LinkIcon className="w-4 h-4 text-[#C4601A] shrink-0" />
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              } else if (e.key === 'Escape') {
                setShowLinkDialog(false);
              }
            }}
            placeholder="Paste or enter link URL (e.g. https://...)"
            className="flex-1 bg-white border border-[#E8E0D5] rounded-lg px-2.5 py-1 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C4601A]"
          />
          <button
            type="button"
            onClick={applyLink}
            className="px-2.5 py-1 bg-[#C4601A] text-white rounded-lg text-xs font-bold hover:bg-[#A0450F] flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3 h-3" />
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowLinkDialog(false)}
            className="p-1 hover:bg-[#E8E0D5] text-gray-500 rounded-lg cursor-pointer"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── Editor Body ─── */}
      <div className="relative">
        {isSourceMode ? (
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="<p>Enter raw HTML markup here...</p>"
              className="w-full min-h-[160px] p-3 font-mono text-xs text-gray-800 bg-[#FAF8F5] focus:outline-none resize-y"
              rows={8}
            />
            <div className="absolute right-2 bottom-2 text-[10px] text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-mono">
              HTML Source Mode
            </div>
          </div>
        ) : (
          <div className="tiptap-editor-content">
            <EditorContent editor={editor} />
            {editor && editor.isEmpty && (
              <div
                onClick={() => editor.chain().focus().run()}
                className="absolute top-3 left-3.5 text-xs text-gray-400 font-sans pointer-events-none select-none"
              >
                {placeholder}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Status Bar ─── */}
      <div className="bg-[#FAF6F0] border-t border-[#E8E0D5] px-3 py-1.5 flex items-center justify-between text-[10px] font-medium text-gray-500">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Rich Text Enabled</span>
        </div>
      </div>
    </div>
  );
};
