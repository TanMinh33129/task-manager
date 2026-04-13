require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./src/config/database');

const app = express();

// Kết nối MongoDB Atlas
connectDB();

// Middleware bảo mật
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Giới hạn request
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: 'Quá nhiều request, vui lòng thử lại sau' } });
app.use('/api/', limiter);

// Routes
app.use('/api/auth',   require('./src/routes/authRoutes'));
app.use('/api/tasks',  require('./src/routes/taskRoutes'));
app.use('/api/admin',  require('./src/routes/adminRoutes'));
app.use('/api/export', require('./src/routes/exportRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server đang chạy bình thường', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});