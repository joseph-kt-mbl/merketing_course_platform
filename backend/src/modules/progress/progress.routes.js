import express from "express";
import { enrollCourse, getProgress } from "./progress.controller.js";
import paymentMiddleware from "../../middlewares/payment.middleware.js";
import  auth  from "../../middlewares/auth.middleware.js";

const router = express.Router();
router.use(auth);
router.use(paymentMiddleware);

router.post("/enroll",enrollCourse);
router.get("/:courseId", getProgress);

export default router;