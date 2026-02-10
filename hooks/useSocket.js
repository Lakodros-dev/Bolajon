/**
 * Socket.IO Client Hook
 * Real-time updates on client side
 */
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';

let socket = null;

export function useSocket() {
    const { token, isAuthenticated } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState('N/A');
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        if (!isAuthenticated || !token) {
            // Disconnect if not authenticated
            if (socket) {
                socket.disconnect();
                socket = null;
            }
            setIsConnected(false);
            return;
        }

        // Initialize socket if not exists
        if (!socket) {
            const socketUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007';
            
            socket = io(socketUrl, {
                path: '/api/socket',
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: maxReconnectAttempts
            });

            // Connection events
            socket.on('connect', () => {
                console.log('✅ Socket connected:', socket.id);
                setIsConnected(true);
                reconnectAttempts.current = 0;
                setTransport(socket.io.engine.transport.name);

                socket.io.engine.on('upgrade', (transport) => {
                    setTransport(transport.name);
                });
            });

            socket.on('disconnect', (reason) => {
                console.log('❌ Socket disconnected:', reason);
                setIsConnected(false);
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                reconnectAttempts.current++;
                
                if (reconnectAttempts.current >= maxReconnectAttempts) {
                    console.error('Max reconnection attempts reached');
                    socket.disconnect();
                }
            });

            // Ping-pong for connection health
            const pingInterval = setInterval(() => {
                if (socket && socket.connected) {
                    socket.emit('ping');
                }
            }, 30000); // Every 30 seconds

            socket.on('pong', () => {
                console.log('🏓 Pong received');
            });

            return () => {
                clearInterval(pingInterval);
            };
        }

        return () => {
            // Cleanup on unmount
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [isAuthenticated, token]);

    /**
     * Subscribe to event
     */
    const on = useCallback((event, callback) => {
        if (!socket) return;
        socket.on(event, callback);
    }, []);

    /**
     * Unsubscribe from event
     */
    const off = useCallback((event, callback) => {
        if (!socket) return;
        socket.off(event, callback);
    }, []);

    /**
     * Emit event
     */
    const emit = useCallback((event, data) => {
        if (!socket) return;
        socket.emit(event, data);
    }, []);

    return {
        socket,
        isConnected,
        transport,
        on,
        off,
        emit
    };
}

/**
 * Hook for listening to student updates
 */
export function useStudentUpdates(callback) {
    const { on, off } = useSocket();

    useEffect(() => {
        on('student:update', callback);
        return () => off('student:update', callback);
    }, [on, off, callback]);
}

/**
 * Hook for listening to lesson updates
 */
export function useLessonUpdates(callback) {
    const { on, off } = useSocket();

    useEffect(() => {
        on('lesson:update', callback);
        return () => off('lesson:update', callback);
    }, [on, off, callback]);
}

/**
 * Hook for listening to reward updates
 */
export function useRewardUpdates(callback) {
    const { on, off } = useSocket();

    useEffect(() => {
        on('reward:update', callback);
        return () => off('reward:update', callback);
    }, [on, off, callback]);
}

/**
 * Hook for listening to progress updates
 */
export function useProgressUpdates(callback) {
    const { on, off } = useSocket();

    useEffect(() => {
        on('progress:update', callback);
        return () => off('progress:update', callback);
    }, [on, off, callback]);
}

/**
 * Hook for listening to dashboard updates
 */
export function useDashboardUpdates(callback) {
    const { on, off } = useSocket();

    useEffect(() => {
        on('dashboard:update', callback);
        return () => off('dashboard:update', callback);
    }, [on, off, callback]);
}

/**
 * Hook for listening to subscription updates
 */
export function useSubscriptionUpdates(callback) {
    const { on, off } = useSocket();

    useEffect(() => {
        on('subscription:update', callback);
        return () => off('subscription:update', callback);
    }, [on, off, callback]);
}
