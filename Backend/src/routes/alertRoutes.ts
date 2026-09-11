import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { query } from '../config/database';
import { broadcastLiveUpdate } from '../utils/liveUpdates';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { tour_id, type, message, severity } = req.body;
  const user_id = req.user?.id;

  if (!tour_id || !type || !message) {
    return res.status(400).json({ message: 'Tour ID, type, and message are required' });
  }

  try {
    const tourResult = await query('SELECT id FROM tours WHERE id = $1', [tour_id]);
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    const result = await query(
      'INSERT INTO alerts (tour_id, user_id, type, message, severity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tour_id, user_id, type, message, severity || 'medium']
    );

    broadcastLiveUpdate({ type: 'alert', alert: result.rows[0] });

    res.status(201).json({ message: 'Alert created successfully', alert: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating alert', error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT a.*, u.name AS reporter_name, t.title AS tour_title FROM alerts a JOIN users u ON u.id = a.user_id JOIN tours t ON t.id = a.tour_id WHERE a.user_id = $1 ORDER BY a.created_at DESC',
      [req.user?.id]
    );

    res.json({ alerts: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching alerts', error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const alertResult = await query('SELECT user_id FROM alerts WHERE id = $1', [id]);
    if (alertResult.rows.length === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    const alert = alertResult.rows[0];
    if (alert.user_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this alert' });
    }

    const result = await query('UPDATE alerts SET status = $1 WHERE id = $2 RETURNING *', [status, id]);

    res.json({ message: 'Alert updated successfully', alert: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating alert', error: error.message });
  }
});

export default router;
