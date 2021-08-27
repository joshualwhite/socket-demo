import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { Socket } from 'socket.io';
import { BaseGateway } from 'src/core/sockets/base.gateway';
import { Logger } from '@nestjs/common';

interface CreateGameRequest {
  name: string;
}

interface JoinGameRequest {
  username: string;
  game_id: string;
}

interface ScoreRequest {
  username: string;
  game_id: string;
  score: number;
}

@WebSocketGateway()
export class GameGateway extends BaseGateway {
  constructor(private readonly gameService: GameService) {
    super();
  }

  @SubscribeMessage('play-game')
  playGame(@MessageBody() scoreGameRequest: ScoreRequest): void {
    const { username, game_id, score } = scoreGameRequest;

    const { id, ...game } = this.gameService.scoreGame(
      game_id,
      username,
      score,
    );

    this.emitToLobby(id, 'host', { game });
  }

  @SubscribeMessage('create-game')
  createGame(
    @MessageBody() createGameRequest: CreateGameRequest,
    @ConnectedSocket() client: Socket,
  ): void {
    const { id } = this.gameService.createGame(createGameRequest.name);

    client.join(id);

    client.emit(`events`, {
      type: 'game_created',
      success: true,
      game_id: id,
    });
  }

  @SubscribeMessage('join-game')
  joinGame(
    @MessageBody() joinGameRequest: JoinGameRequest,
    @ConnectedSocket() client: Socket,
  ): void {
    const { username, game_id } = joinGameRequest;

    const { id, ...game } = this.gameService.joinGame(username, game_id);

    const logger = new Logger();
    logger.log(username, 'joined the game');

    client.join(id);

    this.emitToLobby(id, 'game', { ...game });
  }
}
