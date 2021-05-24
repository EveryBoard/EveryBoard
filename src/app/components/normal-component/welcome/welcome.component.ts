import { Component } from '@angular/core';
import { GameService } from 'src/app/services/GameService';
import { GameInfo } from '../pick-game/pick-game.component';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
    public readonly games: GameInfo[] = GameInfo.ALL_GAMES;

    public constructor(private gameService: GameService) {
    }
    public async createGame(game: string): Promise<void> {
        return this.gameService.createGameAndRedirectOrShowError(game);
    }
}
