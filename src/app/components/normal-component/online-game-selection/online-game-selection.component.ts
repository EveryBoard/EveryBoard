import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MGPValidation } from '@everyboard/lib';

import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { CurrentGameService } from 'src/app/services/CurrentGameService';

@Component({
    selector: 'app-online-game-selection',
    templateUrl: './online-game-selection.component.html',
})
export class OnlineGameSelectionComponent {

    public constructor(public readonly router: Router,
                       public readonly currentGameService: CurrentGameService,
                       public readonly messageDisplayer: MessageDisplayer) {
    }

    public async pickGame(pickedGame: string): Promise<void> {
        const canUserJoin: MGPValidation = this.currentGameService.canUserCreate();
        if (canUserJoin.isSuccess()) {
            console.log('canUserJoin is success')
            await this.router.navigate(['/play', pickedGame]);
        } else {
            console.log('canUserJoin is failure')
            this.messageDisplayer.criticalMessage(canUserJoin.getReason());
        }
    }
}
