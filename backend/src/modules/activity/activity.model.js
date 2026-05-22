// modules/activity/activity.model.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  type: {
    type: String,
    enum: [
      "REGISTER",
      "ENROLL_PREMIUM",
      "QUIZ_PASSED",
      "COURSE_COMPLETED",
      "PAYMENT_PENDING"
    ],
    required: true,
  },

  meta: {
    type: Object, // flexible data depending on type
    default: {},
  },

  color: {
    type: String, // optional if you want quick UI mapping
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model("Activity", activitySchema);