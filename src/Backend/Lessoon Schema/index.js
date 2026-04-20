// const mongoose = require("mongoose");

// const SubtopicSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   content: { type: String, required: true },
//   imageUrl: String,
//   videoUrl: String,
// });

// const LessonSchema = new mongoose.Schema({
//   courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
//   title: { type: String, required: true },
//   description: String,
//   subtopics: [SubtopicSchema],
//   order: Number, // To sequence lessons
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Lesson", LessonSchema);
