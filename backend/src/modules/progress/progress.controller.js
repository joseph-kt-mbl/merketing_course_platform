import Progress from "./progress.model.js";
import Lesson from "../lesson/lesson.model.js";
import Quiz from "../quiz/quiz.model.js";
import QuizAttempt from "../quizAttempt/quizAttempt.model.js";

export const enrollCourse = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;

  let progress = await Progress.findOne({ userId, courseId });

  if (!progress) {
    progress = await Progress.create({
      userId,
      courseId,
    });
  }

  res.json({ success: true, progress });
};

export const getProgress = async (req, res) => {
  const progress = await Progress.findOne({
    userId: req.user.id,
    courseId: req.params.courseId,
  });

  if(!progress){
    return res.status(200).json({
      success: true,
      progress: null,
      message: "User is not enrolled in this course"
    });
  }

  res.json({ success: true, progress });
};


// export const updateProgress = async (req, res) => {
//   const userId = req.user.id;
//   const { courseId } = req.params;
//   const { nextOrder } = req.body; // 👈 only this comes from client

//   if (!nextOrder || nextOrder < 1) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid lesson order"
//     });
//   }

//   const progress = await Progress.findOne({ userId, courseId });

//   if (!progress) {
//     return res.status(404).json({
//       success: false,
//       message: "Progress not found"
//     });
//   }

//   // ✅ Get all lessons for the course ordered
//   const lessons = await Lesson.find({ courseId }).sort({ order: 1 });

//   if (!lessons.length) {
//     return res.status(400).json({
//       success: false,
//       message: "No lessons found for this course"
//     });
//   }

//   // ✅ Find target lesson
//   const targetLesson = lessons.find(l => l.order === nextOrder);

//   if (!targetLesson) {
//     return res.status(400).json({
//       success: false,
//       message: "Lesson does not exist"
//     });
//   }

//   // ✅ Get current progress level
//   const completedCount = progress.completedLessons.length;

//   // 🔥 Core rule: must progress step-by-step
//   if (nextOrder !== completedCount + 1) {
//     return res.status(400).json({
//       success: false,
//       message: "You must follow lesson order"
//     });
//   }

//   const quiz = await Quiz.findOne({ lessonId: targetLesson._id });

//   if (quiz) {
//     const attempt = await QuizAttempt.findOne({
//       userId,
//       quizId: quiz._id,
//       passed: true
//     });

//     if (!attempt) {
//       return res.status(403).json({
//         success: false,
//         message: "You must pass the quiz before progressing"
//       });
//     }
//   }

//   // ✅ Add lesson safely
//   progress.completedLessons.push(targetLesson._id);

//   // ✅ Update points (server-side)
//   progress.points += targetLesson.points || 0;

//   // ✅ Set next lesson
//   const nextLesson = lessons.find(l => l.order === nextOrder + 1);

//   progress.currentLesson = nextLesson ? nextLesson._id : null;

//   // ✅ Course completed
//   if (!nextLesson) {
//     progress.courseCompleted = true;
//   }

//   await progress.save();

//   res.json({
//     success: true,
//     progress
//   });
// };

export const advanceProgress = async (userId, courseId, lessonId ,score) => {
  const progress = await Progress.findOne({ userId, courseId });

  if (!progress) {
    throw new Error("Progress not found");
  }

  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  //  Prevent duplicate completion
  const alreadyCompleted = progress.completedLessons.some(
    id => id.toString() === lessonId.toString()
  );

  if (alreadyCompleted) {
    throw new Error("Lesson already completed");
  }

  //  Enforce order
  const expectedOrder = progress.completedLessons.length + 1;

  if (lesson.order !== expectedOrder) {
    throw new Error("Invalid lesson order progression");
  }

  //  Apply update
  progress.completedLessons.push(lesson._id);
  progress.points += lesson.points || 0;

  const nextLesson = await Lesson.findOne({
    courseId,
    order: lesson.order + 1
  });

  progress.currentLesson = nextLesson ? nextLesson._id : null;

  if (!nextLesson) {
    progress.courseCompleted = true;
    progress.score = score;
  }

  await progress.save();

  return progress; // optional but clean
};