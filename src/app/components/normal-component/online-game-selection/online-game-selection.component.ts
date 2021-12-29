import { Component } from '@angular/core';
import { GameService } from 'src/app/services/GameService';

@Component({
    selector: 'app-online-game-selection',
    templateUrl: './online-game-selection.component.html',
})
export class OnlineGameSelectionComponent {

    public selectedGame: string;

    public constructor(private gameService: GameService) {
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public async createGame(): Promise<void> {
        this.gameService.createGameAndRedirectOrShowError(this.selectedGame);
    }
}
