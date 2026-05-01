import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from './generated/prisma/client.ts';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
const PORT = 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

prisma.$connect().catch((error) => {
    console.warn('Prisma failed to connect:', error.message);
});

// ✅ Serve MP3 files properly from the /sounds folder
app.use("/sounds", express.static(path.join(__dirname, "sounds")));

// Test route to confirm backend is running
app.get("/", (req, res) => {
    res.send("🎧 Mental Health API is running... Use /sounds/<filename>.mp3 to access files.");
});

// Optional route for sound list
app.get("/api/sounds", (req, res) => {
    const sounds = [
        { id: "rain", name: "Rain", url: "http://localhost:5000/sounds/rain.mp3" },
        { id: "ocean", name: "Ocean Waves", url: "http://localhost:5000/sounds/ocean.mp3" },
        { id: "forest", name: "Forest", url: "http://localhost:5000/sounds/forest.mp3" },
        { id: "fireplace", name: "Fireplace", url: "http://localhost:5000/sounds/fireplace.mp3" },
        { id: "whitenoise", name: "White Noise", url: "http://localhost:5000/sounds/whitenoise.mp3" },
        { id: "cafe", name: "Coffee Shop", url: "http://localhost:5000/sounds/cafe.mp3" },
    ];
    res.json(sounds);
});

// Authentication endpoints
app.post('/api/auth/login', async(req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const { id, name, role } = user;
        return res.json({ id, name, email, role });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Unable to log in.' });
    }
});

app.post('/api/auth/signup', async(req, res) => {
    let { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (!['admin', 'counselor', 'console', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role selected.' });
    }

    if (role === 'console') {
        role = 'counselor';
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists.' });
        }

        const newUser = await prisma.user.create({
            data: { name, email, password, role },
        });

        const { id, name: userName, role: userRole } = newUser;
        return res.status(201).json({ id, name: userName, email, role: userRole });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Unable to sign up.' });
    }
});

// Todos endpoints
app.get('/api/todos/:userId', async(req, res) => {
    const { userId } = req.params;

    try {
        const todos = await prisma.todo.findMany({
            where: { userId: parseInt(userId) },
        });
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Unable to fetch todos.' });
    }
});

app.post('/api/todos', async(req, res) => {
    const { title, userId } = req.body;

    if (!title || !userId) {
        return res.status(400).json({ error: 'Title and userId are required.' });
    }

    try {
        const newTodo = await prisma.todo.create({
            data: { title, userId: parseInt(userId) },
        });
        res.status(201).json(newTodo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Unable to create todo.' });
    }
});

app.put('/api/todos/:id', async(req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    try {
        const updatedTodo = await prisma.todo.update({
            where: { id: parseInt(id) },
            data: { completed },
        });
        res.json(updatedTodo);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Unable to update todo.' });
    }
});

app.delete('/api/todos/:id', async(req, res) => {
    const { id } = req.params;

    try {
        await prisma.todo.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Unable to delete todo.' });
    }
});

// Chat endpoints
app.post('/api/chat', async(req, res) => {
    const { message, role, userId } = req.body;

    if (!message || !role || !userId) {
        return res.status(400).json({ error: 'Message, role, and userId are required.' });
    }

    try {
        const chatMessage = await prisma.chatMessage.create({
            data: { message, role, userId: parseInt(userId) },
        });
        res.status(201).json(chatMessage);
    } catch (error) {
        console.error('Error creating chat message:', error);
        res.status(500).json({ error: 'Unable to create chat message.' });
    }
});

app.get('/api/chat/:userId', async(req, res) => {
    const { userId } = req.params;

    try {
        const messages = await prisma.chatMessage.findMany({
            where: { userId: parseInt(userId) },
            orderBy: { createdAt: 'asc' },
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ error: 'Unable to fetch chat messages.' });
    }
});

// Appointment endpoints
app.get('/api/appointments/:userId', async(req, res) => {
    const { userId } = req.params;

    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId: parseInt(userId) },
            include: { counselor: true },
        });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Unable to fetch appointments.' });
    }
});

app.post('/api/appointments', async(req, res) => {
    const { userId, counselorId, date, time, sessionType, notes } = req.body;

    if (!userId || !counselorId || !date || !time) {
        return res.status(400).json({ error: 'UserId, counselorId, date, and time are required.' });
    }

    try {
        const appointment = await prisma.appointment.create({
            data: {
                userId: parseInt(userId),
                counselorId: parseInt(counselorId),
                date: new Date(date),
                time,
                sessionType: sessionType || 'video',
                notes,
            },
        });
        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Unable to create appointment.' });
    }
});

app.put('/api/appointments/:id', async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedAppointment = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: { status },
        });
        res.json(updatedAppointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Unable to update appointment.' });
    }
});

// Message endpoints
app.get('/api/messages/:userId', async(req, res) => {
    const { userId } = req.params;

    try {
        const sentMessages = await prisma.message.findMany({
            where: { senderId: parseInt(userId) },
            include: { receiver: true },
        });
        const receivedMessages = await prisma.message.findMany({
            where: { receiverId: parseInt(userId) },
            include: { sender: true },
        });
        res.json({ sent: sentMessages, received: receivedMessages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Unable to fetch messages.' });
    }
});

app.post('/api/messages', async(req, res) => {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ error: 'SenderId, receiverId, and content are required.' });
    }

    try {
        const message = await prisma.message.create({
            data: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                content,
            },
        });
        res.status(201).json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Unable to create message.' });
    }
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('sendMessage', (data) => {
        io.emit('receiveMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
