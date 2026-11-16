import React from 'react';
import { SAREE_GRADIENTS } from '../data';

export interface ProductThumbnailProps {
  id?: number;
  imageUrl?: string;
  altText?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

/**
 * Shared uniform 4:5 portrait thumbnail component across the entire site.
 * Renders full image with object-contain centered on neutral #FAF6F0 background
 * so that zero cropping occurs and cards remain aligned across all viewports.
 */
export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  id,
  imageUrl,
  altText,
  priority = false,
  className = '',
  imageClassName = '',
  width,
  height,
  children
}) => {
  const hasImage = Boolean(imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0);

  return (
    <div
      className={`product-thumb-container relative w-full aspect-[4/5] bg-[#FAF6F0] flex items-center justify-center overflow-hidden ${className}`}
    >
      {hasImage ? (
        <img
          src={imageUrl}
          alt={altText || 'Sneh Sarees Handloom Kota Doria Saree'}
          loading={priority ? 'eager' : 'lazy'}
          // @ts-ignore
          fetchpriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          width={width || 400}
          height={height || 500}
          className={`product-thumb-img w-full h-full object-contain object-center block select-none ${imageClassName}`}
        />
      ) : id !== undefined ? (
        <div
          className="w-full h-full relative overflow-hidden"
          style={{
            background:
              typeof id === 'number' && !isNaN(id)
                ? SAREE_GRADIENTS[Math.floor(Math.abs(id)) % SAREE_GRADIENTS.length] || SAREE_GRADIENTS[0]
                : SAREE_GRADIENTS[0]
          }}
        >
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none" stroke="currentColor" className="text-white">
              <path d="M32 8c0 0-8 8-8 16s8 8 8 8 8 0 8-8-8-16-8-16z" />
              <path d="M32 36c0 0-8 8-8 16s8 8 8 8 8 0 8-8-8-16-8-16z" />
              <path d="M8 32c0 0 8-8 16-8s8 8 8 8-8 8-8 8-16-8-16-8z" />
              <path d="M36 32c0 0 8-8 16-8s8 8 8 8-8 8-8 8-16-8-16-8z" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/5" />
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default ProductThumbnail;
