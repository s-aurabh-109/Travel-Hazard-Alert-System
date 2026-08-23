import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { query } from '../config/database';

const router = express.Router();

router.post('/trigger', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { user_id, tour_id, message, severity, type = 'escalation' } = req.body;

  if (!user_id || !tour_id || !message) {
    return res.status(400).json({ message: 'User ID, tour ID, and message are required' });
  }

  try {
    const result = await query(
      'INSERT INTO alerts (tour_id, user_id, type, message, severity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tour_id, user_id, type, message, severity || 'high']
    );

    res.status(201).json({ message: 'Escalation alert created successfully', alert: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating escalation alert', error: error.message });
  }
});

router.get('/history', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { user_id } = req.query;

  try {
    let queryText = 'SELECT * FROM alerts WHERE type IN ($1, $2, $3) ORDER BY created_at DESC LIMIT 100';
    let params: unknown[] = ['geofence', 'admin', 'escalation'];

    if (user_id) {
      queryText = 'SELECT * FROM alerts WHERE user_id = $1 AND type IN ($2, $3, $4) ORDER BY created_at DESC LIMIT 100';
      params = [user_id, 'geofence', 'admin', 'escalation'];
    }

    const result = await query(queryText, params);
    res.json({ alerts: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching escalation history', error: error.message });
  }
});

export default router;
