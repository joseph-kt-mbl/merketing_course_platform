import express from "express";
import { completeLesson , addLesson , editLesson, deleteLesson, getLessons , getLessonByOrder,getLessonById ,getTitles} from "./lesson.controller.js";
import  protect  from "../../middlewares/auth.middleware.js";
import isAdmin from "../../middlewares/admin.middleware.js";
import paymentMiddleware from "../../middlewares/payment.middleware.js";


const router = express.Router();
router.use(protect);

router.post("/:lessonId/complete", completeLesson);
router.post("/add", isAdmin, addLesson);
router.put("/edit/:lessonId",  isAdmin, editLesson);
router.delete("/delete/:lessonId",  isAdmin, deleteLesson);
router.get("/course/:courseId",  paymentMiddleware, getLessons);


router.get("/titles",isAdmin,getTitles);

router.get("/order/:order", paymentMiddleware, getLessonByOrder);
router.get("/id/:lessonId", paymentMiddleware, getLessonById);




export default router;