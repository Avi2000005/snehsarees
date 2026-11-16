import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';
import { sanitizePolicyContentServer } from '../utils/sanitizeHtml';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

/**
 * Public: Get all published policies (summary list)
 */
export const getPublishedPolicies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policies = await db.getPublishedPolicies();
    // Return safe public fields
    res.json(
      policies.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        updated_at: p.updated_at,
      }))
    );
  } catch (e) {
    next(e);
  }
};

/**
 * Public (with optional admin bypass): Get a single policy by slug
 */
export const getPolicyBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: 'Policy slug is required' });
    }

    // Check if requester has admin token (allows viewing unpublished/drafts)
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
        if (decoded && (decoded.role === 'admin' || decoded.email?.toLowerCase() === 'info@snehsarees.in')) {
          isAdmin = true;
        }
      } catch {
        // Not a valid admin token, proceed as regular visitor
      }
    }

    const policy = await db.getPolicyBySlug(slug, isAdmin);
    if (!policy) {
      return res.status(404).json({ error: 'This policy is not available yet' });
    }

    res.json(policy);
  } catch (e) {
    next(e);
  }
};

/**
 * Admin: Get all policies (including unpublished)
 */
export const getAllPoliciesAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policies = await db.getAllPolicies();
    res.json(policies);
  } catch (e) {
    next(e);
  }
};

/**
 * Admin: Create a new policy
 */
export const createPolicyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug, title, content, is_published } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Policy title is required' });
    }

    const rawSlug = slug && slug.trim() ? slug : title;
    const cleanSlug = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      return res.status(400).json({ error: 'A valid policy slug is required' });
    }

    // Sanitize rich-text content on save to prevent stored XSS
    const sanitizedContent = sanitizePolicyContentServer(content || '');

    const newPolicy = await db.createPolicy({
      slug: cleanSlug,
      title: title.trim(),
      content: sanitizedContent,
      is_published: is_published !== undefined ? !!is_published : true,
    });

    res.status(201).json(newPolicy);
  } catch (e: any) {
    if (e.message && e.message.includes('already exists')) {
      return res.status(409).json({ error: e.message });
    }
    next(e);
  }
};

/**
 * Admin: Update an existing policy
 */
export const updatePolicyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Valid policy ID is required' });
    }

    const { slug, title, content, is_published } = req.body || {};

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) {
      const cleanSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!cleanSlug) {
        return res.status(400).json({ error: 'Slug cannot be empty' });
      }
      updateData.slug = cleanSlug;
    }
    if (content !== undefined) {
      updateData.content = sanitizePolicyContentServer(content);
    }
    if (is_published !== undefined) {
      updateData.is_published = !!is_published;
    }

    const updated = await db.updatePolicy(id, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(updated);
  } catch (e: any) {
    if (e.message && e.message.includes('already exists')) {
      return res.status(409).json({ error: e.message });
    }
    next(e);
  }
};

/**
 * Admin: Delete a policy
 */
export const deletePolicyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Valid policy ID is required' });
    }

    const success = await db.deletePolicy(id);
    if (!success) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json({ message: 'Policy deleted successfully', id });
  } catch (e) {
    next(e);
  }
};
