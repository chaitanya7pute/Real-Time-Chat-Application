import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create an HTTP server to wrap our Express application instance
const server = http.createServer(app);

// Attach Socket.io to the server with CORS allowances configured
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Root API Health Check Route
app.get('/', (req, res) => {
    res.json({ success: true, message: "Real-Time WebSocket Server is operating smoothly." });
});

// Handle real-time communication events
io.on('connection', (socket) => {
    console.log(`🔌 A user connected to chat: ${socket.id}`);

    // Listen for incoming message event from a client room
    socket.on('chat_message', (data) => {
        console.log(`✉️ Message received from ${data.username}: ${data.text}`);
        
        // Broadcast the message instantly to EVERY single connected user
        io.emit('broadcast_message', {
            username: data.username,
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Chat Server streaming live on port ${PORT}`);
});