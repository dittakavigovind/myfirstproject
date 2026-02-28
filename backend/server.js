const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
// Force Restart 2
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./src/config/db');


// Import Route Modules
const authRoutes = require('./src/routes/authRoutes');
const astroRoutes = require('./src/routes/astroRoutes');
const panchangRoutes = require('./src/routes/panchangRoutes');
const horoscopeRoutes = require('./src/routes/horoscopeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const seoSettingsRoutes = require('./src/routes/seoSettingsRoutes');
const horoscopeManagerRoutes = require('./src/routes/horoscopeManagerRoutes');
const walletRoutes = require('./src/routes/walletRoutes');
const agoraRoutes = require('./src/routes/agoraRoutes');
const userRoutes = require('./src/routes/userRoutes');
const earningsRoutes = require('./src/routes/earningsRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const poojaRoutes = require('./src/routes/poojaRoutes');

// Initialize App
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
// Database Connection
connectDB().then(async () => {
    // Auto-seed Admin User on Startup (for In-Memory or Demo)
    try {
        const User = require('./src/models/User');
        const bcrypt = require('bcryptjs');

        const adminExists = await User.findOne({ email: 'admin@way2astro.com' });
        if (!adminExists) {
            console.log('Seeding Admin User...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await User.create({
                name: 'System Admin',
                email: 'admin@way2astro.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('--> Admin Created: admin@way2astro.com / admin123');
        }

        // Auto-seed Demo User logic removed.

        // Auto-seed Astrologers logic removed.
    } catch (err) {
        console.error('Seeding Error:', err.message);
    }
});

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "*", // allow all for dev
        methods: ["GET", "POST"]
    }
});

const Message = require('./src/models/Message');
const Chat = require('./src/models/Chat');

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join_chat', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            const { roomId, senderId, content } = data;

            // Save to Database
            const newMessage = new Message({
                chatId: roomId,
                sender: senderId,
                content: content
            });
            await newMessage.save();

            // Update Chat's last message
            await Chat.findByIdAndUpdate(roomId, {
                lastMessage: newMessage._id,
                updatedAt: Date.now()
            });

            // Populate sender info before emitting (optional but helpful)
            await newMessage.populate('sender', 'name');

            io.to(roomId).emit('receive_message', newMessage);
        } catch (err) {
            console.error("Socket Error:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Basic Route
app.get('/', (req, res) => {
    res.send('Way2Astro Backend is Running');
});

// Import Routes
app.use('/api/seo', require('./src/routes/seoSettingsRoutes'));
app.use('/api/horoscope-manager', require('./src/routes/horoscopeManagerRoutes'));
app.use('/api/wallet', require('./src/routes/walletRoutes'));
app.use('/api/agora', require('./src/routes/agoraRoutes'));
// app.use('/api/auth', require('./src/routes/otpRoutes')); // Merged into authRoutes
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/auth', authRoutes);
app.use('/api/astro', astroRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/astro/earnings', earningsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/panchang', panchangRoutes);
app.use('/api/horoscope', horoscopeRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/site-settings', require('./src/routes/siteSettingsRoutes'));
app.use('/api/chat', chatRoutes);
app.use('/api/activity', require('./src/routes/activityRoutes'));
app.use('/api/page-content', require('./src/routes/pageContentRoutes'));
app.use('/api/popups', require('./src/routes/popupRoutes'));
app.use('/api/pooja', poojaRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
