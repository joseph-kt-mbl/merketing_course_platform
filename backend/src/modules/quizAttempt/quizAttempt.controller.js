import QuizAttempt from "./quizAttempt.model.js";
import Quiz from "../quiz/quiz.model.js";
import { advanceProgress } from "../progress/progress.controller.js";
import Course from "../course/course.model.js";
import Lesson from "../lesson/lesson.model.js";
import Activity from "../activity/activity.model.js";
import { logActivity } from "../../utils/activityLogger.js"; 


export const addAttempt = async (req, res) => {
  const userId = req.user.id;
  const { quizId, answers } = req.body;

  if (!quizId || !Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      message: "quizId and answers are required"
    });
  }

  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found"
    });
  }

  const total = quiz.questions.length;

  let correct = 0;
  const slice = 100 / total;

    quiz.questions.forEach((q, index) => {
        const userAnswer = answers.find(a => a.questionIndex === index);

        if (!userAnswer) return;

        const selectedOption = q.options[userAnswer.selectedIndex];

        if (selectedOption === q.correctAnswer) {
            correct++;
        }
    });

  const score = Math.round(correct * slice); 
  const passed = score >= quiz.passingScore;

  const attempt = new QuizAttempt({
    userId,
    quizId,
    answers,
    score,
    passed
  });

  await attempt.save();

  if (passed && quiz.lessonId) {
    // QUIZ PASSED, ADVANCE PROGRESS
    // generate log for admin
    console.log(`User ${userId} passed quiz ${quizId} with score ${score}. Advancing progress...`);
    await logActivity({ userId, type: "QUIZ_PASSED", meta: { quizId, score }, color: "green" });
    
    await advanceProgress(userId, quiz.courseId, quiz.lessonId);
  }

  res.status(201).json({
    success: true,
    message: "Quiz attempt saved successfully",
    attempt
  });
};