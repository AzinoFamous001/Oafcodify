require("dotenv").config();
const fs = require("fs-extra");
const path = require("path");
const connectDB = require("./config/database");
const User = require("./models/User");

const FILE_PATH = path.join(__dirname, "users.json");

async function migrateUsers() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("Connected to MongoDB");

    // Read existing users from file
    if (!fs.existsSync(FILE_PATH)) {
      console.log("No users.json file found. Nothing to migrate.");
      return;
    }

    const data = await fs.readFile(FILE_PATH, "utf8");
    const usersFromFile = data ? JSON.parse(data) : [];

    console.log(`Found ${usersFromFile.length} users in users.json`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const userFromFile of usersFromFile) {
      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({ email: userFromFile.email });

      if (existingUser) {
        console.log(`Skipping user ${userFromFile.email} - already exists in MongoDB`);
        skippedCount++;
        continue;
      }

      // Create new user in MongoDB
      const newUser = new User({
        id: userFromFile.id,
        fullName: userFromFile.fullName,
        email: userFromFile.email,
        password: userFromFile.password,
        provider: userFromFile.provider || 'local',
        googleId: userFromFile.googleId,
        githubId: userFromFile.githubId,
        avatar: userFromFile.avatar,
        quizResults: userFromFile.quizResults || [],
        lessonProgress: userFromFile.lessonProgress || {},
        streak: userFromFile.streak || { current: 0, lastLogin: null },
        notifications: userFromFile.notifications || [],
        completedCourses: userFromFile.completedCourses || 0
      });

      await newUser.save();
      console.log(`Migrated user: ${userFromFile.email}`);
      migratedCount++;
    }

    console.log(`\nMigration complete!`);
    console.log(`Migrated: ${migratedCount} users`);
    console.log(`Skipped: ${skippedCount} users`);

    // Backup the original file
    const backupPath = path.join(__dirname, "users.json.backup");
    await fs.copy(FILE_PATH, backupPath);
    console.log(`\nBackup created at: ${backupPath}`);

  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

migrateUsers();
