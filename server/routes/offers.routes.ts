import { Router } from 'express';
import { getActiveOffers } from '../controllers/offer.controller';

const router = Router();

// Public endpoint: active offers and valid promotions
router.get('/', getActiveOffers);

export default router;
