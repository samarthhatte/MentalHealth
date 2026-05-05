import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/sounds", express.static(path.join(__dirname, "sounds")));

// --- AUTH ROUTES ---

// SIGNUP ROUTE
app.post("/api/auth/signup", async (req, res) => {
  // We use 'name' here because that's what your frontend useState sends
  const { name, email, role, password } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: {
        name: name, 
        email: email,
        role: role || "user",
        password: password, // Reminder: Hash this with bcrypt soon!
      },
    });
    res.status(201).json({ message: "User created successfully!", user: newUser });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(400).json({ error: "Email already exists or invalid data" });
  }
});

// LOGIN ROUTE (This fixes your 404 error)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Explicitly send the role back
    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role // 👈 THIS MUST BE HERE
      } 
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- OTHER ROUTES ---

// SAVE CHAT MESSAGE
app.post("/api/chat/save", async (req, res) => {
  const { message, role, userId } = req.body;

  try {
    const savedMessage = await prisma.chatMessage.create({
      data: {
        message: message,
        role: role, // "user" or "assistant"
        userId: parseInt(userId),
      },
    });
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error saving chat:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// GET CHAT HISTORY
app.get("/api/chat/history/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const history = await prisma.chatMessage.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'asc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});


// GET USER OVERVIEW STATS (Fixes the dashboard 404s)
app.get("/api/user/overview", async (req, res) => {
  const { email } = req.query;
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: String(email) },
      include: {
        _count: {
          select: { todos: true, chatMessages: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      totalTodos: user._count.todos || 0,
      totalMessages: user._count.chatMessages || 0,
      moodAverage: 4.5, // Placeholder: implement mood tracking logic later
      streakDays: 3     // Placeholder: implement streak logic later
    });
  } catch (error) {
    console.error("Overview error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.send("🎧 Mental Health API is running.");
});

app.get("/api/sounds", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const sounds = [
    { id: "rain", name: "Rain", url: `${baseUrl}/sounds/rain.mp3` },
    { id: "ocean", name: "Ocean Waves", url: `${baseUrl}/sounds/ocean.mp3` },
  ];
  res.json(sounds);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});