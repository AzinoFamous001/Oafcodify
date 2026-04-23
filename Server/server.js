const express = require("express");
const fs = require("fs-extra");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const FILE_PATH = path.join(__dirname, "users.json");

app.use(cors());
app.use(express.json());

const getUsers = async () => {
  if (!fs.existsSync(FILE_PATH)) await fs.outputJson(FILE_PATH, []);
  const data = await fs.readFile(FILE_PATH, "utf8");
  return data ? JSON.parse(data) : [];
};

// REGISTER
app.post("/api/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  const users = await getUsers();

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: "User exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(), // ✅ important
    fullName,
    email,
    password: hashedPassword,
  };

  users.push(newUser);
  await fs.outputJson(FILE_PATH, users);

  res.status(201).json({ message: "Created" });
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const users = await getUsers();

  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // ✅ RETURN ID
  res.status(200).json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
  });
});

app.listen(5000, () => console.log("Server at http://localhost:5000"));
