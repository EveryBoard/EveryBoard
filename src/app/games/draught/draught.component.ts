import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { DraughtLegalityInfo, DraughtRules } from './DraughtRules';
import { DraughtMove } from './DraughtMove';
import { DraughtState } from './DraughtState';
import { Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { DraughtDummyMinimax } from './DraughtDummyMinimax';
import { DraughtTutorial } from './DraughtTutorial';

/**
 * This is an Angular directive to specify that this is a component of the app.
 * You just have adapt the selector and template URL here.
 */
@Component({
    selector: 'app-new-game',
    templateUrl: './draught.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
/**
 * This is the component.
 * The generic base class is `GameComponent`.
 * If you have a rectangular game, you might want to use `RectangularGameComponent` instead.
 */
export class DraughtComponent extends GameComponent<DraughtRules,
                                                    DraughtMove,
                                                    DraughtState,
                                                    DraughtLegalityInfo>
{
    /**
     * The component constructor always takes the same parameters.
     * It must set up the `rules`, `node`, `encoder`, `encoder`, and `availableMinimaxes` fields.
     * The minimax list can remain empty.
     */
    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        // If the board you draw must be rotated of 180° when you play the second player, enable the following:
        // this.hasAsymmetricBoard = true;
        // If your game has scores in-game, enable the following:
        // this.scores = MGPOptional.of([0, 0]);
        this.rules = DraughtRules.get();
        this.node = this.rules.getInitialNode();
        this.encoder = DraughtMove.encoder;
        this.tutorial = new DraughtTutorial().tutorial;
        this.availableMinimaxes = [
            new DraughtDummyMinimax(this.rules, 'New Game Dummy Minimax'),
        ];
    }
    /**
     * This method updates the displayed board.
     */
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
    }
    /**
     * This method should display the last move in the component
     */
    public override async showLastMove(move: DraughtMove): Promise<void> {
        return;
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
     * It takes an optional parameter, being a toast to show to the user upon the move cancelation.
     */

}
