import { Component } from '@angular/core';
import { RectangularGameComponent } from '../../components/game-components/rectangular-game-component/RectangularGameComponent';
import { MinimaxTestingRules } from 'src/app/games/minimax-testing/MinimaxTestingRules';
import { MinimaxTestingState } from 'src/app/games/minimax-testing/MinimaxTestingState';
import { MinimaxTestingMove } from 'src/app/games/minimax-testing/MinimaxTestingMove';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MinimaxTestingMinimax } from './MinimaxTestingMinimax';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';

@Component({
    selector: 'app-minimax-testing',
    templateUrl: './minimax-testing.component.html',
    styleUrls: [],
})
export class MinimaxTestingComponent extends RectangularGameComponent<MinimaxTestingRules,
                                                                      MinimaxTestingMove,
                                                                      MinimaxTestingState,
                                                                      number>
{
    public coord: Coord = new Coord(-1, -1);

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = new MinimaxTestingRules(MinimaxTestingState);
        this.availableMinimaxes = [
            new MinimaxTestingMinimax(this.rules, 'MinimaxTestingMinimax'),
        ];
        this.encoder = MinimaxTestingMove.encoder;
    }
    public async chooseRight(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_right');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const chosenMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
        return this.chooseMove(chosenMove, this.rules.node.gameState);
    }
    public async chooseDown(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_down');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const chosenMove: MinimaxTestingMove = MinimaxTestingMove.DOWN;
        return this.chooseMove(chosenMove, this.rules.node.gameState);
    }
    public updateBoard(): void {
        const state: MinimaxTestingState = this.rules.node.gameState;
        this.board = state.getCopiedBoard();
        this.coord = state.location;
    }
}
