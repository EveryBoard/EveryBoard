import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ObservedPartService } from 'src/app/services/ObservedPartService';
import { MGPValidation } from 'src/app/utils/MGPValidation';

@Component({
    selector: 'app-online-game-selection',
    templateUrl: './online-game-selection.component.html',
})
export class OnlineGameSelectionComponent {

    public selectedGame: string;

    public constructor(public readonly router: Router,
                       public readonly observedPartService: ObservedPartService,
                       public readonly messageDisplayer: MessageDisplayer) {
    }
    public pickGame(pickedGame: string): void {
        this.selectedGame = pickedGame;
    }
    public async navigateToOnlineGameCreation(): Promise<void> {
        const canUserJoin: MGPValidation = this.observedPartService.canUserCreate();
        if (canUserJoin.isSuccess()) {
            await this.router.navigate(['/play', this.selectedGame]);
        } else {
            this.messageDisplayer.criticalMessage(canUserJoin.getReason());
        }
    }
}
