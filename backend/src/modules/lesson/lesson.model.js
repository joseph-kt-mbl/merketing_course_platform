import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      unique: true,
    },

    content: {
      type: String, // markdown or HTML
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    points: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

// ensure correct order per course
lessonSchema.index({ courseId: 1, order: 1 });

export default mongoose.model("Lesson", lessonSchema);