import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/Auth/auth.route";
import userRoutes from "./modules/User/user.route";
import reviewRoutes from "./modules/review/review.route";
import tuitionRoutes from "./modules/tuition/tuition.route";
import bookmarkRoutes from "./modules/bookmark/bookmark.route";
import applicationRoutes from "./modules/application/application.route";
import notificationRoutes from "./modules/notification/notification.route";
import hireRelationRoutes from "./modules/hireRelation/hireRelation.route";
import portfolioRoutes from "./modules/tutorPortfolio/portfolio.route";
import adminRoutes from "./modules/admin/admin.route";

const app: Application = express();

// parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Allow both your local machine environment AND your new live Vercel domain link
const allowedOrigins = [
  "http://localhost:3000",
  "https://tutor-lagbe-five.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman testing tools)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS Policy across production layers"));
      }
    },
    credentials: true, // Absolutely mandatory for transferring HTTP-Only tokens across domains
  }),
);

app.use(cookieParser());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tuitions", tuitionRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/hire-relations", hireRelationRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Tutor Lagbe!");
});

// global error handler
// not found handler

export default app;
