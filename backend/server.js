import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import roomsRoutes from './src/modules/rooms/rooms.routes.js';
import reservationsRoutes from './src/modules/reservations/reservations.routes.js';
import frontdeskRoutes from './src/modules/frontdesk/frontdesk.routes.js';
import billingRoutes from './src/modules/billing/billing.routes.js';
import cancellationRoutes from './src/modules/cancellation/cancellation.routes.js';
import housekeepingRoutes from './src/modules/housekeeping/housekeeping.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount All 6 Business Domain Modules
app.use('/api/v1/rooms', roomsRoutes);
app.use('/api/v1/reservations', reservationsRoutes);
app.use('/api/v1/front-desk', frontdeskRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/cancellation', cancellationRoutes);
app.use('/api/v1/housekeeping', housekeepingRoutes);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Aura Boutique Hotel PMS API Engine',
    modules: [
      'Module 1: Rooms Inventory',
      'Module 2: Reservations Engine',
      'Module 3: Front Desk Ops',
      'Module 4: Billing & Dynamic Ledger',
      'Module 5: Cancellation & Refunds',
      'Module 6: Housekeeping Tracker',
    ],
    timestamp: new Date().toISOString(),
  });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint Not Found' });
});

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Hotel PMS Master Backend Server running on http://localhost:${PORT}`);
});

export default app;
