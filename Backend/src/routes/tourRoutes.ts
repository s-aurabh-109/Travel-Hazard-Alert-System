import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { query } from '../config/database';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { title, description, location, start_time, end_time } = req.body;
  const creator_id = req.user?.id;

  if (!title || !location) {
    return res.status(400).json({ message: 'Title and location are required' });
  }

  try {
    const result = await query(
      'INSERT INTO tours (creator_id, title, description, location, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [creator_id, title, description, location, start_time, end_time]
    );
    res.status(201).json({ message: 'Tour created successfully', tour: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating tour', error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM tours WHERE creator_id = $1 OR status = $2 ORDER BY created_at DESC',
      [req.user?.id, 'active']
    );
    res.json({ tours: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching tours', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM tours WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json({ tour: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching tour', error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, location, status } = req.body;

  try {
    const tourResult = await query('SELECT creator_id FROM tours WHERE id = $1', [id]);
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const tour = tourResult.rows[0];
    if (tour.creator_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this tour' });
    }

    const result = await query(
      'UPDATE tours SET title = COALESCE($1, title), description = COALESCE($2, description), location = COALESCE($3, location), status = COALESCE($4, status), updated_at = NOW() WHERE id = $5 RETURNING *',
      [title, description, location, status, id]
    );
    res.json({ message: 'Tour updated successfully', tour: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating tour', error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const tourResult = await query('SELECT creator_id FROM tours WHERE id = $1', [id]);
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const tour = tourResult.rows[0];
    if (tour.creator_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this tour' });
    }

    await query('DELETE FROM tours WHERE id = $1', [id]);
    res.json({ message: 'Tour deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting tour', error: error.message });
  }
});

export default router;
