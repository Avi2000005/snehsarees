import { Router } from 'express';
import { getActiveReels } from '../controllers/reel.controller';

const router = Router();

router.get('/', getActiveReels);

export default router;
