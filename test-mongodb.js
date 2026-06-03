require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

console.log("Testing MongoDB connection...");
console.log("MongoDB URI:", MONGODB_URI ? "Found" : "Not found");

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
    
    // Test creating a user
    const User = require("./Server/models/User");
    
    console.log("Testing User model...");
    User.find({})
      .then(users => {
        console.log(`✅ Found ${users.length} users in database`);
        if (users.length > 0) {
          console.log("Sample user:", users[0].email);
        }
        process.exit(0);
      })
      .catch(err => {
        console.error("❌ Error querying users:", err);
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
