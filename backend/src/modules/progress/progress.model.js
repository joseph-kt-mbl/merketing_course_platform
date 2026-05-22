import mongoose from "mongoose";


const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    score: {
      type: Number,
      default: 0,
    },

    points: {
      type: Number,
      default: 0,
    },

    courseCompleted: {
      type: Boolean,
      default: false,
    },

    certificateEarned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// prevent duplicate progress per user/course
ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Progress", ProgressSchema);