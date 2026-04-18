import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const { accessToken } = useAuthStore.getState();

    socket = io(`${import.meta.env.VITE_WS_URL || 'http://localhost:3001'}/hms`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      const { user } = useAuthStore.getState();
      if (user?.role === 'ADMIN' || user?.role === 'STAFF') {
        socket?.emit('join-admin');
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function reconnectSocket() {
  disconnectSocket();
  return getSocket();
}
