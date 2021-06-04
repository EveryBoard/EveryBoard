import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { MinimaxTestingRules } from 'src/app/games/minimax-testing/MinimaxTestingRules';
import { MinimaxTestingPartSlice } from 'src/app/games/minimax-testing/MinimaxTestingPartSlice';
import { MinimaxTestingMove } from 'src/app/games/minimax-testing/MinimaxTestingMove';
import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MinimaxTestingMinimax } from './MinimaxTestingMinimax';
import { Encoder } from 'src/app/jscaip/Encoder';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-minimax-testing',
    templateUrl: './minimax-testing.component.html',
    styleUrls: [],
})
export class MinimaxTestingComponent extends AbstractGameComponent<MinimaxTestingMove,
                                                                   MinimaxTestingPartSlice,
                                                                   LegalityStatus> {
    /** ************************* Common Fields **************************/

    public coord: Coord = new Coord(-1, -1);

    public encoder: Encoder<MinimaxTestingMove> = MinimaxTestingMove.encoder;

    public constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.rules = new MinimaxTestingRules(MinimaxTestingPartSlice);
        this.availableMinimaxes = [
            new MinimaxTestingMinimax(this.rules, 'MinimaxTestingMinimax'),
        ];
    }
    public async chooseRight(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_right');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const chosenMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
        return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public async chooseDown(): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_down');
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }

        const chosenMove: MinimaxTestingMove = MinimaxTestingMove.DOWN;
        return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public updateBoard(): void {
        const slice: MinimaxTestingPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.coord = slice.location;
    }
}
