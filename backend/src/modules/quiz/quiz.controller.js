import Quiz from "./quiz.model.js";
import UserProgress from "../progress/progress.model.js";
import QuizAttempt from "../quizAttempt/quizAttempt.model.js";
import { advanceProgress } from "../progress/progress.controller.js";
import Course from "../course/course.model.js";
import Lesson from "../lesson/lesson.model.js";



export const getQuiz = async (req, res) => {
  const { order } = req.params;
  if(order === undefined){
    return res.status(400).json({
      success: false,
      message: "Lesson order is required"
    });
  }

  const lesson = await Lesson.findOne({ order });
  if (!lesson) {
    return res.status(404).json({ 
      success: false,
      message: "Lesson not found"
    });
  }

  const quiz = await Quiz.findOne({ lessonId: lesson._id });
  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found for this lesson"
    });
  }

  res.json({
    success: true,
    quiz,
  });
};



// export const submitQuiz = async (req, res) => {
//   const userId = req.user.id;
//   const { quizId } = req.params;
//   const { answers } = req.body;

//   if (!answers || !Array.isArray(answers)) {
//     return res.status(400).json({
//       success: false,
//       message: "Answers are required"
//     });
//   }

//   const quiz = await Quiz.findById(quizId);

//   if (!quiz) {
//     return res.status(404).json({
//       success: false,
//       message: "Quiz not found"
//     });
//   }

//   // ✅ Prevent re-passing same quiz
//   const existingPass = await QuizAttempt.findOne({
//     userId,
//     quizId,
//     passed: true
//   });

//   if (existingPass) {
//     return res.status(400).json({
//       success: false,
//       message: "Quiz already passed"
//     });
//   }

//   const totalQuestions = quiz.questions.length;

//   if (!totalQuestions) {
//     return res.status(400).json({
//       success: false,
//       message: "Quiz has no questions"
//     });
//   }

//   let correctCount = 0;

//   for (const answer of answers) {
//     const question = quiz.questions[answer.questionIndex];
//     if (!question) continue;

//     if (answer.selectedIndex === question.correctAnswerIndex) {
//       correctCount++;
//     }
//   }

//   const score = Math.round((correctCount / totalQuestions) * 100);
//   const passed = score >= quiz.passingScore;

//   // ✅ Save attempt FIRST (important for traceability)
//   const attempt = await QuizAttempt.create({
//     userId,
//     quizId,
//     answers,
//     score,
//     passed
//   });

//   // ✅ Then update progress
//   if (passed && quiz.lessonId) {
//     try {
//       await advanceProgress(userId, quiz.courseId, quiz.lessonId);
//     } catch (err) {
//       return res.status(400).json({
//         success: false,
//         message: err.message
//       });
//     }
//   }

//   res.json({
//     success: true,
//     result: {
//       score,
//       passed,
//       correctAnswers: correctCount,
//       totalQuestions
//     },
//     attemptId: attempt._id
//   });
// };


export const createQuiz = async (req, res) => {
  const { courseId, lessonId, questions, passingScore } = req.body;

  // 1. Required fields
  if (!courseId || !questions || passingScore === undefined) {
    return res.status(400).json({
      success: false,
      message: "courseId, questions, passingScore are required"
    });
  }

  // 2. Validate course exists
  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: "Course not found"
    });
  }

  // 3. If lessonId provided → validate it
  if (lessonId) {
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    if (lesson.courseId.toString() !== courseId) {
      return res.status(400).json({
        success: false,
        message: "Lesson does not belong to this course"
      });
    }
  }

  // 4. Validate questions
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Questions must be a non-empty array"
    });
  }

  for (const [index, q] of questions.entries()) {
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      // q.options.length < 2 ||
      q.correctAnswerIndex === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid question at index ${index}`
      });
    }
    questions[index].correctAnswer = q.options[q.correctAnswerIndex];
  }

  // 5. Prevent duplicate quiz for same lesson/course
  const existingQuiz = await Quiz.findOne({
    courseId,
    lessonId: lessonId || null
  });

  if (existingQuiz) {
    return res.status(400).json({
      success: false,
      message: "Quiz already exists for this lesson/course"
    });
  }
  

  // 6. Create quiz
  const quiz = await Quiz.create({
    courseId,
    lessonId: lessonId,
    questions,
    passingScore
  });

  res.status(201).json({
    success: true,
    quiz
  });
};


export const editQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { updates, passingScore } = req.body;

  // 1. Load quiz
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found"
    });
  }

  const questions = quiz.questions;

  // 2. Validate passing score (if provided)
  if (passingScore !== undefined) {
    if (typeof passingScore !== "number" || passingScore < 0 || passingScore > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid passing score"
      });
    }
  }

  // 3. Validate patch structure (NO mutation yet)
  if (updates !== undefined) {
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates must be a non-empty array"
      });
    }

    for (const [i, patch] of updates.entries()) {
      const { index, question } = patch;

      // index validation
      if (
        index === undefined ||
        index < 0 ||
        index > questions.length + i
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid index at patch ${i}`
        });
      }

      // question validation
      if (
        !question ||
        !question.question ||
        !Array.isArray(question.options) ||
        question.options.length < 2 ||
        question.correctAnswerIndex === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid question at patch ${i}`
        });
      }

      if (question.correctAnswerIndex >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: `Correct answer index out of range at patch ${i}`
        });
      }
    }
  }

  // 4. Clone questions (safe working copy)
  const updatedQuestions = [...questions];

  // 5. Apply patches
  if (updates) {
    for (const patch of updates) {
      updatedQuestions[patch.index] = patch.question;
      updatedQuestions[patch.index].correctAnswer = patch.question.options[patch.question.correctAnswerIndex];
    }
  }

  // 6. Commit changes
  quiz.questions = updatedQuestions;

  if (passingScore !== undefined) {
    quiz.passingScore = passingScore;
  }

  await quiz.save();

  // 7. Response
  res.json({
    success: true,
    quiz
  });
};


export const updateQuestionByIndex = async (req, res) => {
  const { quizId, index } = req.params;
  const { question, options, correctAnswer } = req.body;

  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found"
    });
  }

  const idx = Number(index);

  if (idx < 0 || idx >= quiz.questions.length) {
    return res.status(400).json({
      success: false,
      message: "Invalid question index"
    });
  }

  if (
    !question ||
    !Array.isArray(options) ||
    options.length < 2 ||
    !correctAnswer
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid question data"
    });
  }

  quiz.questions[idx] = {
    question,
    options,
    correctAnswer
  };

  await quiz.save();

  res.json({
    success: true,
    quiz
  });
};

export const deleteQuestionByIndex = async (req, res) => {
  const { quizId, index } = req.params;

  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({
      success: false,
      message: "Quiz not found"
    });
  }

  const idx = Number(index);

  if (idx < 0 || idx >= quiz.questions.length) {
    return res.status(400).json({
      success: false,
      message: "Invalid question index"
    });
  }

  // remove question
  quiz.questions.splice(idx, 1);

  await quiz.save();

  res.json({
    success: true,
    quiz
  });
};