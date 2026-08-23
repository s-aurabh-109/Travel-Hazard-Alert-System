import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import { query } from '../config/database';

const router = express.Router();

router.get('/users', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Admin users list', user: req.user });
});

router.get('/alerts', authenticateToken, authorizeRoles('admin'), async (_req, res) => {
  try {
    const alerts = await query(
      'SELECT a.*, u.name AS reporter_name, t.title AS tour_title FROM alerts a JOIN users u ON u.id = a.user_id JOIN tours t ON t.id = a.tour_id ORDER BY a.created_at DESC'
    );
    res.json({ alerts: alerts.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching admin alerts', error: error.message });
  }
});

router.get('/locations', authenticateToken, authorizeRoles('admin'), async (_req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT ON (user_id) user_id, tour_id, latitude, longitude, accuracy, created_at
      FROM tracking_locations
      ORDER BY user_id, created_at DESC
    `);

    res.json({ locations: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching monitored locations', error: error.message });
  }
});

router.get('/dashboard', authenticateToken, authorizeRoles('admin'), async (_req, res) => {
  try {
    const [users, tours, alerts, locations] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM users'),
      query("SELECT COUNT(*)::int AS count FROM tours WHERE status = 'active'"),
      query("SELECT COUNT(*)::int AS count FROM alerts WHERE status = 'open'"),
      query(`
        SELECT DISTINCT ON (user_id) user_id, tour_id, latitude, longitude, accuracy, created_at
        FROM tracking_locations
        ORDER BY user_id, created_at DESC
      `)
    ]);

    const recentAlerts = await query(
      'SELECT a.*, u.name AS reporter_name, t.title AS tour_title FROM alerts a JOIN users u ON u.id = a.user_id JOIN tours t ON t.id = a.tour_id ORDER BY a.created_at DESC LIMIT 10'
    );

    res.json({
      summary: {
        total_users: users.rows[0].count,
        total_tours: tours.rows[0].count,
        open_alerts: alerts.rows[0].count,
        active_users: locations.rows.length
      },
      recent_alerts: recentAlerts.rows,
      active_locations: locations.rows
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching dashboard summary', error: error.message });
  }
});

router.post('/alert-user', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { user_id, tour_id, message, severity } = req.body;

  if (!user_id || !tour_id || !message) {
    return res.status(400).json({ message: 'User ID, tour ID, and message are required' });
  }

  try {
    const result = await query(
      'INSERT INTO alerts (tour_id, user_id, type, message, severity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tour_id, user_id, 'admin', message, severity || 'high']
    );

    res.status(201).json({ message: 'Admin alert sent successfully', alert: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error sending admin alert', error: error.message });
  }
});

export default router;
