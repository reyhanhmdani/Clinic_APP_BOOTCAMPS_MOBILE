import express from 'express';
import { logger } from './middlewares/logger.js';
import mainRouter from './routes/index.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

app.use('/api/v1', mainRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
