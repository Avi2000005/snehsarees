import { Router } from 'express';
import { getPublishedPolicies, getPolicyBySlug } from '../controllers/policy.controller';

const router = Router();

// Public: List all published policies
router.get('/', getPublishedPolicies);

// Public: Get a single policy by its slug
router.get('/:slug', getPolicyBySlug);

export default router;
