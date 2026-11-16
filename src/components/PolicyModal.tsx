import React from 'react';

export type PolicyTab = 'privacy' | 'terms' | 'shipping' | 'cancellation' | 'returns' | 'faqs';

export interface PolicyModalProps {
  isOpen: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
}

/**
 * @deprecated All store policies have been migrated to the database and unified dynamic route `#/policies/:slug`.
 * This modal has been replaced by the single source of truth system.
 */
export const PolicyModal: React.FC<PolicyModalProps> = () => {
  return null;
};
