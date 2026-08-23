import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { query } from '../config/database';

const router = express.Router();

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
};

const verifyTourOwnership = async (tourId: number, user: { id: number; role?: string }) => {
  const tourResult = await query('SELECT creator_id FROM tours WHERE id = $1', [tourId]);
  if (tourResult.rows.length === 0) {
    return { exists: false };
  }

  const tour = tourResult.rows[0];
  const allowed = tour.creator_id === user.id || user.role === 'admin';
  return { exists: true, allowed, tour };
};

router.post('/', authenticateToken, async (req, res) => {
  const { tour_id, name, latitude, longitude, radius_meters, active } = req.body;

  if (!tour_id || !name || typeof latitude !== 'number' || typeof longitude !== 'number' || typeof radius_meters !== 'number') {
    return res.status(400).json({ message: 'Tour ID, name, latitude, longitude, and radius_meters are required' });
  }

  try {
    const ownership = await verifyTourOwnership(tour_id, req.user!);
    if (!ownership.exists) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'Not authorized to manage geofences for this tour' });
    }

    const result = await query(
      'INSERT INTO geofences (tour_id, name, latitude, longitude, radius_meters, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [tour_id, name, latitude, longitude, radius_meters, active !== false]
    );

    res.status(201).json({ message: 'Geofence created successfully', geofence: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating geofence', error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tour_id } = req.query;
    let queryText: string;
    let params: unknown[];

    if (req.user?.role === 'admin') {
      if (tour_id) {
        queryText = 'SELECT * FROM geofences WHERE tour_id = $1 ORDER BY created_at DESC';
        params = [tour_id];
      } else {
        queryText = 'SELECT * FROM geofences ORDER BY created_at DESC';
        params = [];
      }
    } else {
      if (tour_id) {
        queryText = 'SELECT g.* FROM geofences g JOIN tours t ON t.id = g.tour_id WHERE t.creator_id = $1 AND g.tour_id = $2 ORDER BY g.created_at DESC';
        params = [req.user?.id, tour_id];
      } else {
        queryText = 'SELECT g.* FROM geofences g JOIN tours t ON t.id = g.tour_id WHERE t.creator_id = $1 ORDER BY g.created_at DESC';
        params = [req.user?.id];
      }
    }

    const result = await query(queryText, params);
    res.json({ geofences: result.rows });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching geofences', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query('SELECT g.* FROM geofences g JOIN tours t ON t.id = g.tour_id WHERE g.id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    const geofence = result.rows[0];
    if (req.user?.role !== 'admin') {
      const tourResult = await query('SELECT creator_id FROM tours WHERE id = $1', [geofence.tour_id]);
      if (tourResult.rows[0].creator_id !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized to view this geofence' });
      }
    }

    res.json({ geofence });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching geofence', error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, radius_meters, active } = req.body;

  try {
    const geofenceResult = await query('SELECT tour_id FROM geofences WHERE id = $1', [id]);
    if (geofenceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    const tourId = geofenceResult.rows[0].tour_id;
    const ownership = await verifyTourOwnership(tourId, req.user!);
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'Not authorized to update this geofence' });
    }

    const result = await query(
      'UPDATE geofences SET name = COALESCE($1, name), latitude = COALESCE($2, latitude), longitude = COALESCE($3, longitude), radius_meters = COALESCE($4, radius_meters), active = COALESCE($5, active), updated_at = NOW() WHERE id = $6 RETURNING *',
      [name, latitude, longitude, radius_meters, typeof active === 'undefined' ? null : active, id]
    );

    res.json({ message: 'Geofence updated successfully', geofence: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating geofence', error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const geofenceResult = await query('SELECT tour_id FROM geofences WHERE id = $1', [id]);
    if (geofenceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    const tourId = geofenceResult.rows[0].tour_id;
    const ownership = await verifyTourOwnership(tourId, req.user!);
    if (!ownership.allowed) {
      return res.status(403).json({ message: 'Not authorized to delete this geofence' });
    }

    await query('DELETE FROM geofences WHERE id = $1', [id]);
    res.json({ message: 'Geofence deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting geofence', error: error.message });
  }
});

router.post('/:id/evaluate', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  try {
    const result = await query(
      'SELECT g.*, t.creator_id FROM geofences g JOIN tours t ON t.id = g.tour_id WHERE g.id = $1 AND g.active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Geofence not found or inactive' });
    }

    const geofence = result.rows[0];
    const distance = calculateDistanceMeters(latitude, longitude, geofence.latitude, geofence.longitude);
    const inside = distance <= geofence.radius_meters;
    let alertResponse: any = null;

    if (!inside) {
      const existingAlert = await query(
        'SELECT id, severity FROM alerts WHERE tour_id = $1 AND user_id = $2 AND type = $3 AND status = $4 ORDER BY created_at DESC LIMIT 1',
        [geofence.tour_id, req.user?.id, 'geofence', 'open']
      );

      if (existingAlert.rows.length > 0) {
        const currentSeverity = existingAlert.rows[0].severity;
        const nextSeverity = currentSeverity === 'high' ? 'critical' : 'high';
        const updatedAlert = await query(
          'UPDATE alerts SET severity = $1, message = $2 WHERE id = $3 RETURNING *',
          [nextSeverity, `Geofence breach escalated: outside boundary by ${Math.round(distance)} meters`, existingAlert.rows[0].id]
        );
        alertResponse = updatedAlert.rows[0];
      } else {
        const createdAlert = await query(
          'INSERT INTO alerts (tour_id, user_id, type, message, severity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [geofence.tour_id, req.user?.id, 'geofence', `Geofence breach detected: outside boundary by ${Math.round(distance)} meters`, 'high']
        );
        alertResponse = createdAlert.rows[0];
      }
    } else {
      const openAlert = await query(
        'SELECT id FROM alerts WHERE tour_id = $1 AND user_id = $2 AND type = $3 AND status = $4 ORDER BY created_at DESC LIMIT 1',
        [geofence.tour_id, req.user?.id, 'geofence', 'open']
      );

      if (openAlert.rows.length > 0) {
        const resolvedAlert = await query('UPDATE alerts SET status = $1 WHERE id = $2 RETURNING *', ['resolved', openAlert.rows[0].id]);
        alertResponse = resolvedAlert.rows[0];
      }
    }

    res.json({
      inside,
      distance_meters: Math.round(distance),
      radius_meters: geofence.radius_meters,
      alert: alertResponse
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error evaluating geofence', error: error.message });
  }
});

export default router;
