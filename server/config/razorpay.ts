import Razorpay from 'razorpay';
import { ENV } from './env';

export let razorpayInstance: Razorpay | null = null;

if (ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    });
    console.log('Payment Gateway: Razorpay initialized.');
  } catch (err: any) {
    console.error('Payment Gateway: Razorpay initialization failed:', err.message);
  }
} else {
  console.log('Payment Gateway: Razorpay keys are missing. checkout will operate in demo/mock mode.');
}
