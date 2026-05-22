import express from 'express';
import userRoutes from './modules/user/user.routes.js';
import courseRoutes from "./modules/course/course.routes.js";
import lessonRoutes from "./modules/lesson/lesson.routes.js";
import progressRoutes from "./modules/progress/progress.routes.js";
import quizRoutes from "./modules/quiz/quiz.routes.js"
import activitiesRoutes from "./modules/activity/activity.routes.js"
import paymentRoutes from "./modules/payment/payment.routes.js"

import errorMiddleware from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import cors from "cors"
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { corsOptions } from './config/cors.config.js';

const app = express();
app.set("trust proxy", 1);
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(limiter);

app.use('/api/users', userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/logs", activitiesRoutes);
app.use("/api/payments", paymentRoutes);

app.get('/', (req, res) => {
  return res.json({ message: "hey" });
});

app.get('/hello', (req, res) => {
  return res.json({ message: "Hello, world!" });
});

app.use(errorMiddleware);

export default app;