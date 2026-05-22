import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

courseSchema.index(
  { singleton: 1 },
  { unique: true }
);

export default mongoose.model("Course", courseSchema);