import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: String,
  ip: String,
   expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // enables TTL
  }
});

export default mongoose.model("RefreshToken", refreshTokenSchema);

