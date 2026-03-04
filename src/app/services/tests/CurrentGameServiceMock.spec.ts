import { TestBed } from '@angular/core/testing';
import { CurrentGame } from 'src/app/domain/User';

import { MGPOptional } from '@everyboard/lib';

import { AbstractCurrentGameService, CurrentGameService } from '../CurrentGameService';

export class CurrentGameServiceMock extends AbstractCurrentGameService {
    public static setCurrentGame(currentGame: MGPOptional<CurrentGame>): void {
        (TestBed.inject(CurrentGameService) as AbstractCurrentGameService as CurrentGameServiceMock)
            .setCurrentGame(currentGame);
    }

    private setCurrentGame(currentGame: MGPOptional<CurrentGame>): void {
        this.changeCurrentGame(currentGame);
    }

}
