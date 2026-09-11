import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Profile route', user: req.user });
});

export default router;
