import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

export class BaseGateway {
  @WebSocketServer()
  server: Server;

  emitToLobby(lobby: string, channel: string, message: any): void {
    this.server.to(lobby).emit(channel, message);
  }
}
