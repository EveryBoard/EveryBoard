import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MGPValidation } from '@everyboard/lib';

import { CurrentGameService } from '../../../services/CurrentGameService';
import { MessageDisplayer } from '../../../services/MessageDisplayer';
import { PickGameComponent } from '../pick-game/pick-game.component';

@Component({
    selector: 'app-online-game-selection',
    templateUrl: './online-game-selection.component.html',
    imports: [PickGameComponent]
})
export class OnlineGameSelectionComponent {
    readonly router = inject(Router);
    readonly currentGameService = inject(CurrentGameService);
    readonly messageDisplayer = inject(MessageDisplayer);


    public async pickGame(pickedGame: string): Promise<void> {
        const canUserJoin: MGPValidation = this.currentGameService.canUserCreate();
        if (canUserJoin.isSuccess()) {
            await this.router.navigate(['/play', pickedGame]);
        } else {
            this.messageDisplayer.criticalMessage(canUserJoin.getReason());
        }
    }
}
