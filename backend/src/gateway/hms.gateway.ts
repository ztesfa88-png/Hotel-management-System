import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/hms',
})
export class HmsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(HmsGateway.name);
  private connectedClients = new Map<string, { userId: string; role: string }>();

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (token) {
        // In production, verify the JWT token here
        this.connectedClients.set(client.id, { userId: 'anonymous', role: 'GUEST' });
      }

      this.logger.log(`Client connected: ${client.id}`);
      client.emit('connected', { message: 'Connected to HMS WebSocket' });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    client.join(`room:${roomId}`);
    this.logger.log(`Client ${client.id} joined room: ${roomId}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    client.leave(`room:${roomId}`);
  }

  @SubscribeMessage('join-admin')
  handleJoinAdmin(@ConnectedSocket() client: Socket) {
    client.join('admin');
    this.logger.log(`Client ${client.id} joined admin channel`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Emit events to clients
  emitRoomStatusUpdate(roomId: string, status: string) {
    this.server.emit('room:status-updated', { roomId, status, timestamp: new Date() });
    this.logger.log(`Room status updated: ${roomId} -> ${status}`);
  }

  emitNewBooking(booking: any) {
    this.server.to('admin').emit('booking:new', {
      booking,
      timestamp: new Date(),
    });
    this.server.emit('rooms:availability-changed', { timestamp: new Date() });
  }

  emitBookingStatusUpdate(bookingId: string, status: string) {
    this.server.emit('booking:status-updated', { bookingId, status, timestamp: new Date() });
  }

  emitPaymentUpdate(bookingId: string, status: string) {
    this.server.emit('payment:updated', { bookingId, status, timestamp: new Date() });
  }

  emitNotification(userId: string, notification: any) {
    this.server.emit(`notification:${userId}`, notification);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
