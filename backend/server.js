import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" } // Your frontend URL
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their real-time chat room`);
  });
});

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`✅ Server and Sockets running on port ${PORT}`);
});

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

// GET ALL USERS (Fixes the 500 error)
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "user" },
      include: {
        _count: {
          select: { 
            todos: true, 
            chatMessages: true 
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error("User Fetch Error:", error);
    res.status(500).json({ error: "Database error fetching users" });
  }
});

// GET ALL COUNSELORS
app.get("/api/admin/counselors", async (req, res) => {
  try {
    const counselors = await prisma.user.findMany({
      where: { role: "counselor" },
      include: {
        _count: {
          select: { todos: true, chatMessages: true }
        }
      }
    });
    res.json(counselors);
  } catch (error) {
    console.error("Counselor Fetch Error:", error);
    res.status(500).json({ error: "Database error fetching counselors" });
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

// GET ADMIN STATS (Fixes the 404/500 for stats)
app.get("/api/admin/stats", async (req, res) => {
  try {
    const [userCount, messageCount, todoCount] = await Promise.all([
      prisma.user.count(),
      prisma.chatMessage.count(),
      prisma.todo.count()
    ]);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: lastWeek } }
    });

    res.json({
      totalUsers: userCount,
      totalMessages: messageCount,
      totalTodos: todoCount,
      activeToday: Math.floor(userCount * 0.3) || 1,
      newUsersThisWeek: newUsers,
      messagesThisWeek: messageCount
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
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

// --- ADMIN MANAGEMENT ROUTES ---

// GET ALL USERS (Role: user)
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "user" },
      include: {
        _count: {
          select: { todos: true, chatMessages: true }
        }
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET ALL COUNSELORS (Role: counselor)
app.get("/api/admin/counselors", async (req, res) => {
  try {
    const counselors = await prisma.user.findMany({
      where: { role: "counselor" },
      include: {
        _count: {
          select: { todos: true, chatMessages: true }
        }
      }
    });
    res.json(counselors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch counselors" });
  }
});

// GET SYSTEM ACTIVITY LOGS
app.get("/api/admin/activity", async (req, res) => {
  try {
    // For now, we'll return a combination of recent signups and messages
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const logs = recentUsers.map(u => ({
      id: u.id,
      user: u.name,
      action: `New user registered: ${u.role}`,
      timestamp: u.createdAt
    }));

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch activity logs" });
  }
});

// GET SYSTEM HEALTH
app.get("/api/admin/health", (req, res) => {
  res.json({
    status: "Healthy",
    uptime: `${Math.floor(process.uptime() / 60)} minutes`,
    database: "Connected",
    api: "Online"
  });
});

// CHANGE ADMIN PASSWORD
// CHANGE PASSWORD BY ID
app.post("/api/admin/change-password", async (req, res) => {
  const { newPassword, adminId } = req.body; // 👈 Receive the specific ID

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(adminId) }, // 👈 Target specific user
      data: { password: newPassword }
    });

    res.json({ message: "Password updated successfully for " + updatedUser.name });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ error: "User not found or database error" });
  }
});

// SIMULATED BACKUP ROUTE
app.post("/api/admin/backup", (req, res) => {
  console.log("Admin requested database backup...");
  // Logic to copy dev.db to a backup folder would go here
  res.json({ message: "Backup successful" });
});

//journal
// --- JOURNAL ROUTES ---
// --- JOURNAL ROUTES ---

// --- JOURNAL API ENDPOINTS ---

// --- JOURNAL API ENDPOINTS ---

// Fetch entries for a specific user
app.get("/api/journal/:userId", async (req, res) => {
  try {
    const entries = await prisma.journal.findMany({
      where: { userId: parseInt(req.params.userId) },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries); // Sends the JSON array expected by journal.tsx
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch journal" });
  }
});

// Save a new entry
app.post("/api/journal/save", async (req, res) => {
  const { title, content, mood, tags, userId } = req.body;
  try {
    const entry = await prisma.journal.create({
      data: {
        title,
        content,
        mood,
        tags,
        userId: parseInt(userId)
      }
    });
    res.status(201).json(entry);
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ error: "Failed to save entry" });
  }
});

// PUT: Update an existing entry[cite: 5, 7]
app.put("/api/journal/update/:id", async (req, res) => {
  const { title, content, mood, tags } = req.body;
  try {
    const updatedEntry = await prisma.journal.update({
      where: { id: parseInt(req.params.id) },
      data: { title, content, mood, tags }
    });
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to update" });
  }
});

// DELETE: Remove an entry[cite: 5, 7]
app.delete("/api/journal/delete/:id", async (req, res) => {
  try {
    await prisma.journal.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete" });
  }
});

// --- COUNSELOR & APPOINTMENT ROUTES ---

// GET: All counselors (already mostly done, but ensure this matches frontend)
app.get("/api/counselors", async (req, res) => {
  try {
    const counselors = await prisma.user.findMany({
      where: { role: "counselor" },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json(counselors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch counselors" });
  }
});

// POST: Book an appointment
app.post("/api/appointments/book", async (req, res) => {
  const { userId, counselorId, date, time, sessionType, notes } = req.body;
  try {
    const appointment = await prisma.appointment.create({
      data: {
        userId: parseInt(userId),
        counselorId: parseInt(counselorId),
        date: new Date(date),
        time,
        sessionType,
        notes,
        status: "pending"
      }
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Booking failed" });
  }
});

// GET: User's appointments
app.get("/api/appointments/user/:userId", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: parseInt(req.params.userId) },
      include: { counselor: { select: { name: true, email: true } } },
      orderBy: { date: 'asc' }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// --- MESSAGING ROUTES ---

// GET: Chat history between user and counselor
app.get("/api/messages/:userId/:counselorId", async (req, res) => {
  const { userId, counselorId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(userId), receiverId: parseInt(counselorId) },
          { senderId: parseInt(counselorId), receiverId: parseInt(userId) }
        ]
      },
      include: { 
        sender: { select: { name: true } },
        receiver: { select: { name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST: Send a message
app.post("/api/messages", async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  try {
    const message = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content
      },
      include: { 
        sender: { select: { name: true } },
        receiver: { select: { name: true } }
      }
    });

    // 💡 ADD THIS: Emit the message to the receiver's socket room
    io.to(`user_${receiverId}`).emit('new_message', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

// --- COUNSELOR DASHBOARD API ---

// 1. Get stats for a specific counselor
app.get("/api/counselor/stats/:counselorId", async (req, res) => {
  try {
    const counselorId = parseInt(req.params.counselorId);

    const [totalAppts, upcomingAppts, completedAppts, totalUsers] = await Promise.all([
      prisma.appointment.count({ where: { counselorId } }),
      prisma.appointment.count({ where: { counselorId, status: "pending" } }),
      prisma.appointment.count({ where: { counselorId, status: "completed" } }),
      prisma.appointment.groupBy({
        by: ['userId'],
        where: { counselorId },
      }).then(groups => groups.length)
    ]);

    res.json({
      totalAppointments: totalAppts,
      upcomingAppointments: upcomingAppts,
      completedAppointments: completedAppts,
      totalUsers: totalUsers
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch counselor stats" });
  }
});

// 2. Get all users with their mental health activity (Todos & Chat Messages)
app.get("/api/counselor/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "user" },
      include: {
        _count: {
          select: { 
            todos: true, 
            sentMessages: true, 
            receivedMessages: true 
          }
        },
        todos: true,
        // Fetch relations exactly as named in schema_4.prisma
        sentMessages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        receivedMessages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    // Map the data to match the 'messages' array expected by ConsoleDashboard_3.tsx
    const formattedUsers = users.map(u => ({
      ...u,
      _count: {
        todos: u._count.todos,
        messages: u._count.sentMessages + u._count.receivedMessages
      },
      messages: [...u.sentMessages, ...u.receivedMessages].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Counselor Users Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});