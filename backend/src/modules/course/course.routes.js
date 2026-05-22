import express from "express";
import { getCourse ,getCourseState ,createCourse ,getCourses ,getCourseInterface } from "./course.controller.js";
import  protect  from "../../middlewares/auth.middleware.js";
import  haspayed  from "../../middlewares/payment.middleware.js";
import isAdmin  from "../../middlewares/admin.middleware.js";


const router = express.Router();
router.use(protect);

router.get("/", isAdmin,getCourses);
router.get("/marketing", haspayed, getCourse);
router.get("/marketing-interface",haspayed, getCourseInterface);
// GET /courses/:courseId/state
router.get("/:courseId/state",haspayed, getCourseState);

router.post("/", isAdmin, createCourse);

export default router;