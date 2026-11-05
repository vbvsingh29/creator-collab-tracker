import { Router, Response } from 'express';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const brandsRouter = Router();

// Protect all brand routes with authentication
brandsRouter.use(requireAuth);

// GET /api/brands - STRICTLY SCOPED: collabs_count and total_spent only reflect the authenticated creator's deals
brandsRouter.get('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const brands = db.prepare(`
      SELECT b.*,
        COUNT(c.id) as collabs_count,
        COALESCE(SUM(CASE WHEN c.user_id = ? THEN c.deal_amount ELSE 0 END), 0) as total_spent
      FROM brands b
      LEFT JOIN collabs c ON b.id = c.brand_id AND c.user_id = ?
      GROUP BY b.id
      ORDER BY b.name ASC
    `).all(userId, userId);

    res.json({ success: true, count: brands.length, data: brands });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/brands
brandsRouter.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { name, category, contact_person, contact_email, contact_phone, avg_payment_speed_days, rating, notes } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Brand name is required.' });
    }

    const id = uuidv4();
    const created_at = new Date().toISOString();

    db.prepare(`
      INSERT INTO brands (id, name, category, contact_person, contact_email, contact_phone, avg_payment_speed_days, rating, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      category ? category.trim() : 'General',
      contact_person ? contact_person.trim() : '',
      contact_email ? contact_email.trim() : '',
      contact_phone ? contact_phone.trim() : '',
      Number(avg_payment_speed_days) || 30,
      Number(rating) || 5,
      notes ? notes.trim() : '',
      created_at
    );

    const created = db.prepare('SELECT * FROM brands WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/brands/:id
brandsRouter.put('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, contact_person, contact_email, contact_phone, avg_payment_speed_days, rating, notes } = req.body;

    const exists = db.prepare('SELECT id FROM brands WHERE id = ?').get(id);
    if (!exists) {
      return res.status(404).json({ success: false, error: 'Brand not found' });
    }

    db.prepare(`
      UPDATE brands SET
        name = ?,
        category = ?,
        contact_person = ?,
        contact_email = ?,
        contact_phone = ?,
        avg_payment_speed_days = ?,
        rating = ?,
        notes = ?
      WHERE id = ?
    `).run(
      name,
      category,
      contact_person || '',
      contact_email || '',
      contact_phone || '',
      avg_payment_speed_days || 30,
      rating || 5,
      notes || '',
      id
    );

    const updated = db.prepare('SELECT * FROM brands WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/brands/:id
brandsRouter.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM brands WHERE id = ?').run(id);
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
