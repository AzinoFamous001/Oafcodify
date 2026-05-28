const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  githubId: { type: String },
  avatar: { type: String },
  streak: { type: Number, default: 0 },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
  codeRuns: { type: Number, default: 0 },
  rank: { type: String, default: "Bronze" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
