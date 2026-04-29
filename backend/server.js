import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import * as orderController from './src/controllers/orderController.js';
import * as chatController from './src/controllers/chatController.js';
import * as homeController from './src/controllers/homeController.js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env - thử root monorepo trước, sau đó thử thư mục hiện tại
// Trong Docker, env vars được inject qua docker-compose nên không cần file .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// CORS – cho phép frontend gọi API
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.get('/', homeController.home);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/orders', orderController.listTasks);
app.post('/api/orders', upload.single('file'), orderController.createTask);
app.patch('/api/orders/:id/status', orderController.updateTaskStatus);
app.post('/api/orders/:id/attachment', upload.single('file'), orderController.uploadAttachment);
app.delete('/api/orders/:id/attachment', orderController.deleteAttachment);

app.get('/api/messages', chatController.listMessages);
app.post('/api/messages', chatController.sendMessage);

export default app;

// Chỉ skip listen khi chạy trên Vercel (serverless)
// Docker production và local dev đều cần listen
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3001);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend running on http://localhost:${port}`);
  });
}
