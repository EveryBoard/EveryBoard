import { GameComponent } from 'src/app/components/game-components/game-component/GameComponent';
import { NewGameLegalityInfo, NewGameRules } from './NewGameRules';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { Component } from '@angular/core';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { MCTS } from 'src/app/jscaip/MCTS';
import { NewGameMoveGenerator } from './NewGameMoveGenerator';
import { NewGameMinimax } from './NewGameMinimax';

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
                                                    RulesConfig,
                                                    NewGameLegalityInfo>
{
    /**
     * The component constructor always takes the same parameters.
     * It must set up the `rules`, `node`, `encoder`, `encoder`, and `availableMinimaxes` fields.
     * The minimax list can remain empty.
     */
    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.setRulesAndNode('NewGame');
        this.availableAIs = [
            new NewGameMinimax(),
            new MCTS($localize`MCTS`, new NewGameMoveGenerator(), this.rules),
        ];
        this.encoder = NewGameMove.encoder;

        // If the board you draw must be rotated of 180° when you play the second player, enable the following:
        // this.hasAsymmetricBoard = true;

        // If your game has scores in-game, enable the following:
        // this.scores = MGPOptional.of([0, 0]);
    }
    /**
     * This method updates the displayed board.
     */
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
    }
    /**
     * This method should display the last move in the component
     */
    public override async showLastMove(move: NewGameMove): Promise<void> {
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
