import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/Auth/auth.route';

const app: Application = express();

// parsers
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend
    credentials: true,
  })
);
app.use(cookieParser());

// application routes
// app.use('/api/v1', router);

// ✅ API Routes
app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Tutor Lagbe!');
});

// global error handler
// not found handler

export default app;
