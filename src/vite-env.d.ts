/// <reference types="vite/client" />

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

// Razorpay env variable (KEY_ID only — KEY_SECRET must never reach frontend)
interface ImportMetaEnv {
  readonly VITE_RAZORPAY_KEY_ID: string;
  [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Razorpay Standard Checkout global (injected via CDN script in index.html)
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: (response: { error: { code: string; description: string; reason: string } }) => void): void;
}

interface RazorpayConstructor {
  new(options: RazorpayOptions): RazorpayInstance;
}

// Augment Window with Razorpay global
interface Window {
  Razorpay: RazorpayConstructor;
}
