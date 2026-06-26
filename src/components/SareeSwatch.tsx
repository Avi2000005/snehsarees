import React from 'react';
import { SAREE_GRADIENTS } from '../data';

interface SareeSwatchProps {
  id: number;
  className?: string;
}

export const SareeSwatch: React.FC<SareeSwatchProps> = ({ id, className = "w-full h-full" }) => {
  const index = typeof id === 'number' && !isNaN(id) ? Math.floor(Math.abs(id)) % SAREE_GRADIENTS.length : 0;
  const grad = SAREE_GRADIENTS[index] || SAREE_GRADIENTS[0];

  return (
    <div
      className={`${className} relative overflow-hidden`}
      style={{ background: grad }}
    >
      {/* Decorative Traditional Indian Motif Overlay */}
      <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
        <svg width="80" height="80" viewBox="0 0 64 64" fill="none" stroke="currentColor" className="text-white">
          <path d="M32 8c0 0-8 8-8 16s8 8 8 8 8 0 8-8-8-16-8-16z" />
          <path d="M32 36c0 0-8 8-8 16s8 8 8 8 8 0 8-8-8-16-8-16z" />
          <path d="M8 32c0 0 8-8 16-8s8 8 8 8-8 8-8 8-16-8-16-8z" />
          <path d="M36 32c0 0 8-8 16-8s8 8 8 8-8 8-8 8-16-8-16-8z" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/5" />
    </div>
  );
};
