import { Injectable, Logger } from '@nestjs/common';

export interface Player {
  username: string;
  score: number;
}

interface Game {
  id: string;
  name: string;
  players: Player[];
}

@Injectable()
export class GameService {
  private gameList = [];

  createGame(name: string) {
    const game = {
      name: name,
      id: String(this.gameList.length + 1),
      players: [],
    };

    this.gameList.push(game);

    return game;
  }

  joinGame(username: string, id: string): Game {
    const game = this.gameList.find((game) => game.id === id);

    if (game.players.length > 8) {
      throw Error('Too many players');
    }

    username = game.players.push({
      username: this.getUnusedUsername(username, game.players),
      score: 0,
    });

    return game;
  }

  scoreGame(id: string, username: string, score: number): Game {
    const game = this.gameList.find((game) => game.id === id);

    const player = game.players.find((player) => player.username === username);
    player.score = score;

    return game;
  }

  private getUnusedUsername(username: string, players: Player[]): string {
    if (players.find((player) => player.username === username) == null) {
      return username;
    }
    for (let i = 1; i++; i < 8) {
      if (
        players.find((player) => player.username === `${username}${i}`) == null
      ) {
        return `${username}${i}`;
      }
    }
  }
}
