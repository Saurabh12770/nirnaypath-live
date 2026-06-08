import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import syllabusRoutes from './routes/syllabus.js';
import learnRoutes from './routes/learn.js';
import testRoutes from './routes/tests.js';
import bookmarkRoutes from './routes/bookmarks.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';

// Load environmental variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
}));

// Standard Middlewares
app.use(express.json({ limit: '20mb' }));
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Base route test
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NirnayPath 3.0 API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
export default app;
