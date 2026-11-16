import { Router } from 'express';
import { getStoreSettings } from '../controllers/settings.controller';

const router = Router();

// Public endpoint for customer-facing store settings (origin, packer details, contact)
router.get('/', getStoreSettings);

export default router;
