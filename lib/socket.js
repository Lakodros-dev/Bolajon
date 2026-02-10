/**
 * Socket.IO Server Configuration
 * Real-time updates for students, lessons, rewards
 */
import { Server } from 'socket.io';
import { verifyToken } from './auth.js';

let io = null;

/**
 * Initialize Socket.IO server
 */
export function initSocketServer(httpServer) {
    if (io) return io;

    io = new Server(httpServer, {
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007',
            methods: ['GET', 'POST'],
            credentials: true
        },
        path: '/api/socket',
        transports: ['websocket', 'polling']
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return next(new Error('Invalid token'));
        }

        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        next();
    });

    // Connection handler
    io.on('connection', (socket) => {
        socket.join(`user:${socket.userId}`);
        socket.join(`role:${socket.userRole}`);

        socket.on('disconnect', () => {});
        socket.on('error', () => {});
        socket.on('ping', () => socket.emit('pong'));
    });

    return io;
}

export function getSocketServer() {
    return io;
}

export function emitToUser(userId, event, data) {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, data);
}

export function emitToRole(role, event, data) {
    if (!io) return;
    io.to(`role:${role}`).emit(event, data);
}

export function emitToAll(event, data) {
    if (!io) return;
    io.emit(event, data);
}

export function broadcastStudentUpdate(teacherId, student, action = 'update') {
    emitToUser(teacherId, 'student:update', { action, student });
}

export function broadcastLessonUpdate(lesson, action = 'update') {
    emitToRole('teacher', 'lesson:update', { action, lesson });
    emitToRole('admin', 'lesson:update', { action, lesson });
}

export function broadcastRewardUpdate(reward, action = 'update') {
    emitToRole('teacher', 'reward:update', { action, reward });
    emitToRole('admin', 'reward:update', { action, reward });
}

export function broadcastProgressUpdate(teacherId, progress) {
    emitToUser(teacherId, 'progress:update', progress);
}

export function broadcastDashboardUpdate(teacherId, stats) {
    emitToUser(teacherId, 'dashboard:update', stats);
}

export function broadcastSubscriptionUpdate(userId, subscription) {
    emitToUser(userId, 'subscription:update', subscription);
}

export default {
    initSocketServer,
    getSocketServer,
    emitToUser,
    emitToRole,
    emitToAll,
    broadcastStudentUpdate,
    broadcastLessonUpdate,
    broadcastRewardUpdate,
    broadcastProgressUpdate,
    broadcastDashboardUpdate,
    broadcastSubscriptionUpdate
};
