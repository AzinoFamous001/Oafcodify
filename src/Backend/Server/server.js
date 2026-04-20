// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("🚀 CodeBay Database Connected"))
//   .catch((err) => console.error("Database Connection Error:", err));

// // Routes
// app.get("/api/lessons/:id", async (req, res) => {
//   try {
//     const lesson = await require("./models/Lesson").findById(req.params.id);
//     res.json(lesson);
//   } catch (err) {
//     res.status(404).json({ message: "Lesson not found" });
//   }
// });

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
