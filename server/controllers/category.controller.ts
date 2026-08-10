import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';
import { ENV } from '../config/env';
import cloudinary from '../config/cloudinary';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await db.getCategories();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, imageUrl, description, history, properties, care } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required to create a category.' });
    }
    const created = await db.createCategory({
      name,
      slug,
      imageUrl: imageUrl || undefined,
      description: description || undefined,
      history: history || undefined,
      properties: properties || undefined,
      care: care || undefined
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Category ID.' });
    }
    const { name, slug, imageUrl, description, history, properties, care } = req.body;
    const updated = await db.updateCategory(id, { name, slug, imageUrl, description, history, properties, care });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Category not found.' });
    }
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid Category ID.' });
    }
    const success = await db.deleteCategory(id);
    if (success) {
      res.json({ success: true, message: 'Category deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Category not found.' });
    }
  } catch (err) {
    next(err);
  }
};

// Upload category image to Cloudinary (reuses same infrastructure as product images)
export const uploadCategoryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    // Mock upload if Cloudinary API key is missing
    if (!ENV.CLOUDINARY_API_KEY) {
      console.log('Cloudinary: Operating in demo/mock mode. Simulating category image upload.');
      return res.json({
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80',
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'laxmi_store_categories' },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary category upload failed, falling back to mock placeholder:', error.message);
          return res.json({
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=200&q=80',
          });
        }
        res.json({ imageUrl: result?.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};
