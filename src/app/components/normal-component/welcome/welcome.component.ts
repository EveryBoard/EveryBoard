import { Component } from '@angular/core';
import { GameInfo } from '../pick-game/pick-game.component';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
    public readonly games: GameInfo[] = GameInfo.ALL_GAMES;
}
