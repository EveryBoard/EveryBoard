import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { NewGameLegalityInfo, NewGameRules } from './NewGameRules';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { NewGameDummyMinimax } from './NewGameDummyMinimax';
import { NewGameTutorial } from './NewGameTutorial';

/**
 * This is an Angular directive to specify that this is a component of the app.
 * You just have adapt the selector and template URL here.
 */
@Component({
    selector: 'app-new-game',
    templateUrl: './new-game.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
/**
 * This is the component.
 * The generic base class is `GameComponent`.
 * If you have a rectangular game, you might want to use `RectangularGameComponent` instead.
 */
export class NewGameComponent extends GameComponent<NewGameRules,
                                                    NewGameMove,
                                                    NewGameState,
                                                    NewGameLegalityInfo>
{
    /**
     * The component constructor always takes the same parameters.
     * It must set up the `rules`, `node`, `encoder`, `encoder`, and `availableMinimaxes` fields.
     * The minimax list can remain empty.
     */
    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        // If the board you draw must be rotated of 180° when you play the second player, enable the following:
        // this.hasAsymetricBoard = true;
        // If your game has scores in-game, enable the following:
        // this.scores = MGPOptional.of([0, 0]);
        this.rules = NewGameRules.get();
        this.node = this.rules.getInitialNode();
        this.encoder = NewGameMove.encoder;
        this.tutorial = new NewGameTutorial().tutorial;
        this.availableAIs = [
            new NewGameDummyMinimax(),
        ];
    }
    /**
     * This method updates the displayed board.
     */
    public updateBoard(): void {
    }
    /**
     * This method should display the last move in the component
     */
    public override showLastMove(move: NewGameMove): void {
    }
    /**
     * This method should clear out any data coming from a move attempt
     */
    public override cancelMoveAttempt(): void {
    }


    /**
     * In the component's HTML, you will likely set onClick elements.
     * You can call back to the component, and call `this.chooseMove` to apply a move.
     * In case you want to cancel a move, you can call `this.cancelMove`.
     * It takes an optional parameter, being a toast to show to the user upon the move cancellation.
     */

}
