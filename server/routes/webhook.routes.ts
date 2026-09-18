import { Router } from 'express';
import { handleShiprocketWebhook } from '../controllers/webhook.controller';

const router = Router();

// Shiprocket Webhook receivers
// Note: Shiprocket explicitly forbids keywords 'shiprocket', 'kartrocket', 'sr', 'kr' in the webhook URL.
// Therefore, we provide clean aliases: /tracking, /delivery, /fulfillment, as well as /shiprocket.
router.post('/tracking', handleShiprocketWebhook);
router.post('/delivery', handleShiprocketWebhook);
router.post('/fulfillment', handleShiprocketWebhook);
router.post('/shiprocket', handleShiprocketWebhook);

// Health check endpoints for testing webhook connectivity
router.get('/tracking', (req, res) => {
  res.json({ status: 'active', service: 'Logistics Webhook Receiver', endpoint: '/api/webhooks/tracking' });
});

router.get('/delivery', (req, res) => {
  res.json({ status: 'active', service: 'Logistics Webhook Receiver', endpoint: '/api/webhooks/delivery' });
});

router.get('/shiprocket', (req, res) => {
  res.json({ status: 'active', service: 'Logistics Webhook Receiver', endpoint: '/api/webhooks/shiprocket' });
});

export default router;
