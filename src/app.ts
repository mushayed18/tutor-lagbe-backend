import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/Auth/auth.route';
import userRoutes from './modules/User/user.route';
import reviewRoutes from './modules/review/review.route';
import tuitionRoutes from './modules/tuition/tuition.route';
import bookmarkRoutes from './modules/bookmark/bookmark.route';
import applicationRoutes from './modules/application/application.route';
import notificationRoutes from './modules/notification/notification.route';
import hireRelationRoutes from './modules/hireRelation/hireRelation.route';

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

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tuitions', tuitionRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hire-relations', hireRelationRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Tutor Lagbe!');
});

// global error handler
// not found handler

export default app;
