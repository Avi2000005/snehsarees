export interface Product {
  id: number;
  name: string;
  price: number;
  fabric: string;
  occasion: string;
  colour: string;
  tags: string[];
  isReel: boolean;
  views?: string;
  rating: number;
  reviews: number;
  blouse: boolean;
  desc: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  fabric: string;
  colour: string;
  qty: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  method: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface ChatReply {
  msg: string;
  replies: string[];
  action?: 'silk' | 'cotton' | 'wedding' | 'wa';
}

export type ActivePage =
  | 'landing'
  | 'home'
  | 'search'
  | 'viewall'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'success'
  | 'wishlist'
  | 'orders'
  | 'profile'
  | 'bulk'
  | 'knowledge';
