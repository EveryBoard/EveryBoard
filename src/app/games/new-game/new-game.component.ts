import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { NewGameLegalityInfo, NewGameRules } from './NewGameRules';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';

@Component({
    selector: 'app-new-game',
    templateUrl: './new-game.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class NewGameComponent extends GameComponent<NewGameRules,
                                                    NewGameMove,
                                                    NewGameState,
                                                    NewGameLegalityInfo>
{
    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        // If the board you draw must be rotated of 180° when you play the second player
        // this.hasAsymetricBoard = true;
        this.rules = NewGameRules.get();
        this.availableMinimaxes = [
            new NewGameDummyMinimax(this.rules, 'New Game Dummy Minimax'),
        ];
        this.encoder = NewGameMove.encoder;
        this.tutorial = new NewGameTutorial().tutorial;
        // If your game has score before the end
        // this.scores = MGPOptional.of([0, 0]);
        this.updateBoard();
    }
    public updateBoard(): void {
        throw new Error('Method not implemented.');
    }
}
