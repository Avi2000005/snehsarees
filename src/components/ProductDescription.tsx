import React, { useMemo } from 'react';
import { normalizeDescriptionToHtml, sanitizeHtml, isHtmlEmpty } from '../utils/sanitizeHtml';

interface ProductDescriptionProps {
  content: string | undefined | null;
  className?: string;
  showEmptyState?: boolean;
}

/**
 * ProductDescription renders rich-text product descriptions safely with DOMPurify
 * and elegant, responsive SnehSarees e-commerce typography.
 */
export const ProductDescription: React.FC<ProductDescriptionProps> = ({
  content,
  className = '',
  showEmptyState = false,
}) => {
  const cleanHtml = useMemo(() => {
    if (!content) return '';
    const normalized = normalizeDescriptionToHtml(content);
    return sanitizeHtml(normalized);
  }, [content]);

  if (isHtmlEmpty(cleanHtml)) {
    if (showEmptyState) {
      return (
        <div className="text-xs text-gray-400 italic py-2">
          No description available for this handcrafted saree yet.
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={`product-description-prose font-serif text-[#4A4A4A] text-sm md:text-base leading-relaxed break-words
        [&>p]:mb-3.5 [&>p:last-child]:mb-0
        [&>h2]:text-base md:[&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-[#1A1A1A] [&>h2]:mt-5 [&>h2]:mb-2.5 [&>h2]:pb-1.5 [&>h2]:border-b [&>h2]:border-[#E8E0D5]/80 [&>h2:first-child]:mt-0
        [&>h3]:text-sm md:[&>h3]:text-base [&>h3]:font-bold [&>h3]:text-[#2A2A2A] [&>h3]:mt-4 [&>h3]:mb-2 [&>h3:first-child]:mt-0
        [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-3 [&>ul]:space-y-1.5
        [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-3 [&>ol]:space-y-1.5
        [&_li]:pl-1.5 [&_li]:leading-relaxed
        [&>ul>li]:marker:text-[#C4601A] [&>ol>li]:marker:text-[#C4601A] [&>ol>li]:marker:font-semibold
        [&_strong]:font-bold [&_strong]:text-[#1A1A1A]
        [&_em]:italic [&_em]:text-[#222222]
        [&_u]:underline [&_u]:underline-offset-3 [&_u]:decoration-[#C4601A]/60
        [&_s]:line-through [&_s]:text-gray-400
        [&_a]:text-[#C4601A] hover:[&_a]:text-[#9E3E07] [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium [&_a]:transition-colors
        [&>blockquote]:border-l-3 [&>blockquote]:border-[#C4601A] [&>blockquote]:pl-3.5 [&>blockquote]:py-1.5 [&>blockquote]:my-3.5 [&>blockquote]:bg-[#FAF6F0]/80 [&>blockquote]:rounded-r-lg [&>blockquote]:italic [&>blockquote]:text-[#555555]
        [&>hr]:my-4 [&>hr]:border-0 [&>hr]:border-t [&>hr]:border-[#E8E0D5]
        [&_.text-left]:text-left [&_.text-center]:text-center [&_.text-right]:text-right [&_.text-justify]:text-justify
        ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

