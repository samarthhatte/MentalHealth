import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT ;
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

        const createdUser = await prisma.user.create({
            data: {
                name,
                email,
                password,
                role,
            },
        });

        const { id, role: userRole } = createdUser;
        return res.status(201).json({ id, name, email, role: userRole });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Unable to create account.' });
    }
});

// ==================== ADMIN API ROUTES ====================

// Admin Stats Endpoint
app.get("/api/admin/stats", async(req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { _count: { select: { todos: true, chatMessages: true } } },
        });

        let totalMessages = 0;
        let totalTodos = 0;
        for (const u of users) {
            totalMessages += (u._count && u._count.chatMessages) || 0;
            totalTodos += (u._count && u._count.todos) || 0;
        }

        const stats = {
            totalUsers: users.length,
            totalMessages,
            totalTodos,
            activeToday: Math.max(10, Math.floor(Math.random() * 30) + 10),
            newUsersThisWeek: Math.max(5, Math.floor(Math.random() * 15) + 5),
            messagesThisWeek: Math.max(50, Math.floor(Math.random() * 200) + 50)
        };
        res.json(stats);
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Unable to fetch stats.' });
    }
});

// Admin Users Endpoint
app.get("/api/admin/users", async(req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { _count: { select: { todos: true, chatMessages: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ error: 'Unable to fetch users.' });
    }
});

// Admin Get Single User
app.get("/api/admin/users/:id", async(req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.id, 10) },
            include: { _count: { select: { todos: true, chatMessages: true } } },
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error('Get admin user error:', error);
        res.status(500).json({ error: 'Unable to fetch user.' });
    }
});

// Admin Delete User
app.delete("/api/admin/users/:id", async(req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const deleted = await prisma.user.delete({ where: { id } });
        res.json({ message: "User deleted successfully", id: deleted.id });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(404).json({ error: "User not found" });
    }
});

// Admin System Health Endpoint
app.get("/api/admin/health", (req, res) => {
    const health = {
        status: 'healthy',
        uptime: process.uptime ? `${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m` : '24h 32m',
        database: 'connected',
        api: 'operational'
    };
    res.json(health);
});

// Admin Activity Log Endpoint
app.get("/api/admin/activity", async(req, res) => {
    try {
        const messages = await prisma.chatMessage.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { user: { select: { name: true } } },
        });

        const activities = messages.map((message) => ({
            id: message.id,
            user: message.user.name,
            action: message.role === 'assistant' ? 'Received a response' : 'Sent a message',
            timestamp: message.createdAt.toISOString(),
        }));

        res.json(activities);
    } catch (error) {
        console.error('Admin activity error:', error);
        res.status(500).json({ error: 'Unable to fetch activity.' });
    }
});

// User overview endpoint for role-specific dashboard metrics
app.get('/api/user/overview', async(req, res) => {
    const email = req.query.email && req.query.email.toString();
    if (!email) {
        return res.status(400).json({ error: 'Email query is required.' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { _count: { select: { todos: true, chatMessages: true } } },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const streakDays = Math.max(1, Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) % 30);
        const overview = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            totalTodos: (user._count && user._count.todos) || 0,
            totalMessages: (user._count && user._count.chatMessages) || 0,
            moodAverage: 7.4,
            streakDays,
            upcomingSessions: [
                { title: 'Guided breathing', time: 'Tomorrow 09:00 AM' },
                { title: 'Weekly journal review', time: 'Thu 04:00 PM' },
            ],
        };

        res.json(overview);
    } catch (error) {
        console.error('User overview error:', error);
        res.status(500).json({ error: 'Unable to fetch overview.' });
    }

});

// ==================== COUNSELOR ROUTES ====================

// Get all users for counselor (with mental health data)
app.get('/api/counselor/users', async(req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'user' },
            include: {
                _count: { select: { todos: true, chatMessages: true } },
                todos: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                chatMessages: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { user: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Get counselor users error:', error);
        res.status(500).json({ error: 'Unable to fetch users.' });
    }
});

// Get specific user details for counselor
app.get('/api/counselor/users/:userId', async(req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.userId) },
            include: {
                _count: { select: { todos: true, chatMessages: true } },
                todos: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                chatMessages: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                    include: { user: { select: { name: true } } }
                },
                appointments: {
                    include: {
                        counselor: { select: { name: true, email: true } }
                    },
                    orderBy: { date: 'desc' }
                }
            }
        });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Get counselor user details error:', error);
        res.status(500).json({ error: 'Unable to fetch user details.' });
    }
});

// Get counselor stats
app.get('/api/counselor/stats/:counselorId', async(req, res) => {
    try {
        const counselorId = parseInt(req.params.counselorId);

        const appointments = await prisma.appointment.findMany({
            where: { counselorId },
            include: { user: true }
        });

        const totalAppointments = appointments.length;
        const upcomingAppointments = appointments.filter(a => new Date(a.date) > new Date()).length;
        const completedAppointments = appointments.filter(a => new Date(a.date) <= new Date()).length;

        const stats = {
            totalAppointments,
            upcomingAppointments,
            completedAppointments,
            totalUsers: new Set(appointments.map(a => a.userId)).size
        };

        res.json(stats);
    } catch (error) {
        console.error('Get counselor stats error:', error);
        res.status(500).json({ error: 'Unable to fetch counselor stats.' });
    }
});

// ==================== APPOINTMENT ROUTES ====================

// Get all counselors
app.get('/api/counselors', async(req, res) => {
    try {
        const counselors = await prisma.user.findMany({
            where: { role: 'counselor' },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
            }
        });
        res.json(counselors);
    } catch (error) {
        console.error('Get counselors error:', error);
        res.status(500).json({ error: 'Unable to fetch counselors.' });
    }
});

// Book appointment
app.post('/api/appointments/book', async(req, res) => {
    const { userId, counselorId, date, time, sessionType, notes } = req.body;

    if (!userId || !counselorId || !date || !time) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const appointment = await prisma.appointment.create({
            data: {
                userId: parseInt(userId),
                counselorId: parseInt(counselorId),
                date: new Date(date),
                time,
                sessionType: sessionType || 'video',
                notes
            },
            include: {
                user: { select: { name: true, email: true } },
                counselor: { select: { name: true, email: true } }
            }
        });
        res.status(201).json(appointment);
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ error: 'Unable to book appointment.' });
    }
});

// Get user appointments
app.get('/api/appointments/user/:userId', async(req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { userId: parseInt(req.params.userId) },
            include: {
                counselor: { select: { name: true, email: true } }
            },
            orderBy: { date: 'asc' }
        });
        res.json(appointments);
    } catch (error) {
        console.error('Get user appointments error:', error);
        res.status(500).json({ error: 'Unable to fetch appointments.' });
    }
});

// Get counselor appointments
app.get('/api/appointments/counselor/:counselorId', async(req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { counselorId: parseInt(req.params.counselorId) },
            include: {
                user: { select: { name: true, email: true } }
            },
            orderBy: { date: 'asc' }
        });
        res.json(appointments);
    } catch (error) {
        console.error('Get counselor appointments error:', error);
        res.status(500).json({ error: 'Unable to fetch appointments.' });
    }
});

// Update appointment status
app.put('/api/appointments/:id/status', async(req, res) => {
    const { status } = req.body;
    try {
        const appointment = await prisma.appointment.update({
            where: { id: parseInt(req.params.id) },
            data: { status },
            include: {
                user: { select: { name: true, email: true } },
                counselor: { select: { name: true, email: true } }
            }
        });
        res.json(appointment);
    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ error: 'Unable to update appointment.' });
    }
});

// ==================== SEEDING ROUTE (FOR DEVELOPMENT) ====================

app.post('/api/seed/counselors', async(req, res) => {
    try {
        const counselors = [
            { name: 'Dr. Sarah Chen', email: 'sarah.chen@counselor.com', password: 'password123', role: 'counselor' },
            { name: 'Dr. Michael Rodriguez', email: 'michael.rodriguez@counselor.com', password: 'password123', role: 'counselor' },
            { name: 'Dr. Emily Johnson', email: 'emily.johnson@counselor.com', password: 'password123', role: 'counselor' },
            { name: 'Dr. David Kim', email: 'david.kim@counselor.com', password: 'password123', role: 'counselor' }
        ];

        for (const counselor of counselors) {
            const existing = await prisma.user.findUnique({
                where: { email: counselor.email }
            });
            if (!existing) {
                await prisma.user.create({ data: counselor });
            }
        }

        res.json({ message: 'Counselors seeded successfully' });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ error: 'Failed to seed counselors' });
    }
});

// Get messages between two users
app.get('/api/messages/:userId/:otherUserId', async(req, res) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: parseInt(req.params.userId), receiverId: parseInt(req.params.otherUserId) },
                    { senderId: parseInt(req.params.otherUserId), receiverId: parseInt(req.params.userId) }
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
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Unable to fetch messages.' });
    }
});

// Send message
app.post('/api/messages', async(req, res) => {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

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
        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Unable to send message.' });
    }
});

// Mark messages as read
app.put('/api/messages/read/:userId/:otherUserId', async(req, res) => {
    try {
        await prisma.message.updateMany({
            where: {
                senderId: parseInt(req.params.otherUserId),
                receiverId: parseInt(req.params.userId),
                isRead: false
            },
            data: { isRead: true }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Mark messages read error:', error);
        res.status(500).json({ error: 'Unable to mark messages as read.' });
    }
});

// ==================== SOCKET.IO SETUP ====================

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user room for private messaging
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room`);
    });

    // Handle private messages
    socket.on('private_message', async(data) => {
        const { senderId, receiverId, content } = data;

        try {
            // Save message to database
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

            // Emit to receiver's room
            io.to(`user_${receiverId}`).emit('new_message', message);
            // Also emit back to sender for confirmation
            io.to(`user_${senderId}`).emit('message_sent', message);
        } catch (error) {
            console.error('Socket message error:', error);
            socket.emit('message_error', { error: 'Failed to send message' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
    console.log(`🎵 Sound files available at: http://localhost:${PORT}/sounds/&lt;filename&gt;.mp3`);
    console.log(`📊 Admin dashboard available at: http://localhost:5173/admin`);
    console.log(`💬 Socket.io enabled for real-time messaging`);
});