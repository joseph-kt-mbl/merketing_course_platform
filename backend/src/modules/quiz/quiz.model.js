import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null, // null = final exam
    },

    title: {
      type: String,
      default: "Quiz",
    },

    questions: [
      {
         _id: false,
        question: {
          type: String,
          required: true,
        },

        options: {
          type: [String],
          required: true,
        },

        correctAnswer: {
          type: String,
          required: true,
        },
      },
    ],

    passingScore: {
      type: Number,
      default: 70, // percent
    },
  },
  { timestamps: true }
);

quizSchema.index(
  { lessonId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("Quiz", quizSchema);