import express from "express";
import {
  getQuiz,
//   getQuizById,
  createQuiz,
  editQuiz,
//   deleteQuiz,
//   submitQuiz,
  deleteQuestionByIndex,
  updateQuestionByIndex
} from "./quiz.controller.js";

import { addAttempt } from "../quizAttempt/quizAttempt.controller.js";

import protect from "../../middlewares/auth.middleware.js";
import isAdmin from "../../middlewares/admin.middleware.js";
import paymentMiddleware from "../../middlewares/payment.middleware.js";

const router = express.Router();

// ========================
//  AUTH REQUIRED
// ========================
router.use(protect);



// ========================
// 👤 USER ROUTES
// ========================

// get quiz by course
router.get("/order/:order", getQuiz);

// get quiz by id (safer / recommended)
// router.get("/:quizId", getQuizById);

// submit quiz answers
// router.post("/:quizId/submit", submitQuiz);



// ========================
// 🔒 ADMIN ROUTES
// ========================

// create quiz
router.post("/", isAdmin, createQuiz);

router.post("/attempts", paymentMiddleware, addAttempt);

// update quiz
router.patch("/:quizId", isAdmin, editQuiz);

// delete quiz
// router.delete("/:quizId", isAdmin, deleteQuiz);
router.delete("/:quizId/q/:index", isAdmin, deleteQuestionByIndex);
router.patch("/:quizId/q/:index", isAdmin, updateQuestionByIndex);




export default router;