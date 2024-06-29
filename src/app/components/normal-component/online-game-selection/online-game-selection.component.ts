import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { CurrentGameService } from 'src/app/services/CurrentGameService';
import { MGPValidation } from '@everyboard/lib';

@Component({
    selector: 'app-online-game-selection',
    templateUrl: './online-game-selection.component.html',
})
export class OnlineGameSelectionComponent {

    public selectedGame: string;

    public constructor(public readonly router: Router,
                       public readonly currentGameService: CurrentGameService,
                       public readonly messageDisplayer: MessageDisplayer) {
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public async navigateToOnlineGameCreation(): Promise<void> {
        const canUserJoin: MGPValidation = this.currentGameService.canUserCreate();
        if (canUserJoin.isSuccess()) {
            await this.router.navigate(['/play', this.selectedGame]);
        } else {
            this.messageDisplayer.criticalMessage(canUserJoin.getReason());
        }
    }
}
