import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'node:http';
import { initializeDatabase } from './config/database';
import { registerWebSocketServer } from './utils/liveUpdates';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import profileRoutes from './routes/profileRoutes';
import tourRoutes from './routes/tourRoutes';
import alertRoutes from './routes/alertRoutes';
import emergencyContactRoutes from './routes/emergencyContactRoutes';
import geofenceRoutes from './routes/geofenceRoutes';
import trackingRoutes from './routes/trackingRoutes';
import escalationRoutes from './routes/escalationRoutes';

dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT) || 5000;
const server = http.createServer(app);
registerWebSocketServer(server);

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/emergency-contacts', emergencyContactRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/escalation', escalationRoutes);

const startServer = async (): Promise<void> => {
  await initializeDatabase();

  if (require.main === module) {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
};

void startServer();

export { app, server };
export default app;

module.exports = app;
module.exports.default = app;
module.exports.app = app;
module.exports.server = server;
