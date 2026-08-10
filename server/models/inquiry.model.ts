export interface Inquiry {
  id?: number;
  name: string;
  boutique?: string;
  whatsapp: string;
  quantity: string;
  preferredType: string;
  details?: string;
  status: 'pending' | 'contacted' | 'closed';
  createdAt?: string;
}
