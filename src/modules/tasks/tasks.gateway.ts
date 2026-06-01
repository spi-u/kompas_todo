import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Task } from './entities/task.entity';
import { TASK_STATUS_EVENT, userRoom } from './tasks.constants';

@WebSocketGateway({ cors: { origin: '*' } })
export class TasksGateway implements OnGatewayConnection {
  private readonly logger = new Logger(TasksGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    try {
      const token = this.extractToken(client);
      const payload = this.jwtService.verify<JwtPayload>(token);
      client.data.userId = payload.sub;
      void client.join(userRoom(payload.sub));
    } catch {
      this.logger.warn(`Unauthorized connection rejected: ${client.id}`);
      client.disconnect();
    }
  }

  emitTaskStatus(ownerId: string, task: Task): void {
    this.server.to(userRoom(ownerId)).emit(TASK_STATUS_EVENT, {
      id: task.id,
      status: task.status,
      updatedAt: task.updatedAt,
    });
  }

  private extractToken(client: Socket): string {
    const fromAuth = client.handshake.auth?.token as string | undefined;
    const [scheme, headerToken] =
      client.handshake.headers.authorization?.split(' ') ?? [];
    const fromHeader = scheme === 'Bearer' ? headerToken : undefined;
    const token = fromAuth ?? fromHeader;
    if (!token) {
      throw new Error('missing_token');
    }
    return token;
  }
}
