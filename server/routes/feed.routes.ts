import { Router } from 'express';
import { getMetaXmlFeed, getMetaCsvFeed } from '../controllers/feed.controller';

const router = Router();

/**
 * Meta / Facebook / Instagram Commerce Manager XML product feed.
 * Accessible at:
 *   /api/feed/meta
 *   /api/feed/meta.xml
 *   /api/feed/feed.xml
 */
router.get('/meta', getMetaXmlFeed);
router.get('/meta.xml', getMetaXmlFeed);
router.get('/feed.xml', getMetaXmlFeed);

/**
 * Same data as CSV — useful for manual upload to Meta Commerce Manager.
 * Accessible at:
 *   /api/feed/meta.csv
 *   /api/feed/feed.csv
 */
router.get('/meta.csv', getMetaCsvFeed);
router.get('/feed.csv', getMetaCsvFeed);

export default router;

