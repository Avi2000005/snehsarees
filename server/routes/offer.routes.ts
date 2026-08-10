import { Router } from 'express';
import { getActiveBanners } from '../controllers/offer.controller';

const router = Router();

router.get('/', getActiveBanners);

export default router;
