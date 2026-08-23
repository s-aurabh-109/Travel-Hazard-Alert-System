import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { query } from '../config/database';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { name, phone, relationship, is_primary } = req.body;
  const user_id = req.user?.id;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required' });
  }

  try {
    const result = await query(
      'INSERT INTO emergency_contacts (user_id, name, phone, relationship, is_primary) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, name, phone, relationship || null, Boolean(is_primary)]
    );

    res.status(201).json({ message: 'Emergency contact created successfully', contact: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating emergency contact', error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM emergency_contacts WHERE user_id = $1 ORDER BY created_at DESC', [req.user?.id]);
    res.json({ contacts: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching emergency contacts', error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, phone, relationship, is_primary } = req.body;

  if (!name && !phone && !relationship && typeof is_primary === 'undefined') {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const contactResult = await query('SELECT user_id FROM emergency_contacts WHERE id = $1', [id]);
    if (contactResult.rows.length === 0) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }

    const contact = contactResult.rows[0];
    if (contact.user_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this contact' });
    }

    const result = await query(
      'UPDATE emergency_contacts SET name = COALESCE($1, name), phone = COALESCE($2, phone), relationship = COALESCE($3, relationship), is_primary = COALESCE($4, is_primary), updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, phone, relationship, typeof is_primary === 'undefined' ? null : Boolean(is_primary), id]
    );

    res.json({ message: 'Emergency contact updated successfully', contact: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating emergency contact', error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const contactResult = await query('SELECT user_id FROM emergency_contacts WHERE id = $1', [id]);
    if (contactResult.rows.length === 0) {
      return res.status(404).json({ message: 'Emergency contact not found' });
    }

    const contact = contactResult.rows[0];
    if (contact.user_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this contact' });
    }

    await query('DELETE FROM emergency_contacts WHERE id = $1', [id]);
    res.json({ message: 'Emergency contact deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting emergency contact', error: error.message });
  }
});

export default router;
