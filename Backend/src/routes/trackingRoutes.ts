import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { query } from '../config/database';
import { broadcastLiveUpdate } from '../utils/liveUpdates';

const router = express.Router();

router.post('/locations', authenticateToken, async (req, res) => {
  const { tour_id, latitude, longitude, accuracy } = req.body;
  const user_id = req.user?.id;

  if (!tour_id || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Tour ID, latitude, and longitude are required' });
  }

  try {
    const result = await query(
      'INSERT INTO tracking_locations (user_id, tour_id, latitude, longitude, accuracy) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, tour_id, latitude, longitude, accuracy || null]
    );

    broadcastLiveUpdate({
      type: 'location',
      user_id,
      tour_id,
      location: result.rows[0]
    });

    res.status(201).json({ message: 'Location saved successfully', location: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error saving location', error: error.message });
  }
});

router.get('/locations', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM tracking_locations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.user?.id]);

    res.json({ locations: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching locations', error: error.message });
  }
});

router.get('/latest', authenticateToken, async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  try {
    const result = await query('SELECT * FROM tracking_locations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No location found for user' });
    }

    res.json({ location: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching latest location', error: error.message });
  }
});

export default router;
