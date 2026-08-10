import express from 'express';
import { ENV } from './config/env';
import apiRoutes from './routes';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://snehsarees.in',
  'https://www.snehsarees.in',
  'https://admin.snehsarees.in'
];

const isAllowedOrigin = (origin: string): boolean => {
  if (allowedOrigins.includes(origin)) return true;
  if (ENV.FRONTEND_URL && origin === ENV.FRONTEND_URL) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

// Custom CORS middleware to avoid extra package dependencies
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(loggerMiddleware);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Sneh Sarees Backend API is live and operational ✨', status: 'ok', health: '/health', api: '/api' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Master routes mounting
app.use('/api', apiRoutes);

// Error middleware registration (MUST be registered last)
app.use(errorMiddleware);

app.listen(ENV.PORT, () => {
  console.log(`Server: Running on http://localhost:${ENV.PORT}`);
  console.log(`Environment: ${ENV.NODE_ENV}`);
});
