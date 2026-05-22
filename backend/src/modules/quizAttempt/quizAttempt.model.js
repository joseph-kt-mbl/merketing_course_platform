import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },

  answers: [
    {
      _id: false,
      questionIndex: Number,
      selectedIndex: Number
    }
  ],

  score: Number,
  passed: Boolean,
}, { timestamps: true });


export default mongoose.model('QuizAttempt', quizAttemptSchema);

