import { Component } from '@angular/core';
import { AbstractGameComponent } from '../../components/game-components/abstract-game-component/AbstractGameComponent';
import { MinimaxTestingRules } from 'src/app/games/minimax-testing/MinimaxTestingRules';
import { MinimaxTestingPartSlice } from 'src/app/games/minimax-testing/MinimaxTestingPartSlice';
import { MinimaxTestingMove } from 'src/app/games/minimax-testing/MinimaxTestingMove';
import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Minimax } from 'src/app/jscaip/Minimax';
import { MinimaxTestingMinimax } from './MinimaxTestingMinimax';

@Component({
    selector: 'app-minimax-testing',
    templateUrl: './minimax-testing.component.html',
    styleUrls: [],
})
export class MinimaxTestingComponent extends AbstractGameComponent<MinimaxTestingMove,
                                                                   MinimaxTestingPartSlice,
                                                                   LegalityStatus> {
    /** ************************* Common Fields **************************/

    public availableMinimaxes: Minimax<MinimaxTestingMove, MinimaxTestingPartSlice>[] = [
        new MinimaxTestingMinimax('MinimaxTestingMinimax'),
    ];
    public rules: MinimaxTestingRules = new MinimaxTestingRules(MinimaxTestingPartSlice);

    public coord: Coord = new Coord(-1, -1);

    public chooseRight(): Promise<MGPValidation> {
        const chosenMove: MinimaxTestingMove = MinimaxTestingMove.RIGHT;
        return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public chooseDown(): Promise<MGPValidation> {
        const chosenMove: MinimaxTestingMove = MinimaxTestingMove.DOWN;
        return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public updateBoard(): void {
        const slice: MinimaxTestingPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.coord = slice.location;
    }
    public decodeMove(encodedMove: number): MinimaxTestingMove {
        return MinimaxTestingMove.decode(encodedMove);
    }
    public encodeMove(move: MinimaxTestingMove): number {
        return MinimaxTestingMove.encode(move);
    }
}
