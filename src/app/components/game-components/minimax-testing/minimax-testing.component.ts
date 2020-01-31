import {Component} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
import { MinimaxTestingRules } from 'src/app/games/minimax-testing/MinimaxTestingRules';
import { MinimaxTestingPartSlice } from 'src/app/games/minimax-testing/MinimaxTestingPartSlice';
import { MinimaxTestingMove } from 'src/app/games/minimax-testing/MinimaxTestingMove';
import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

@Component({
    selector: 'app-minimax-testing',
    templateUrl: './minimax-testing.component.html',
    styleUrls: []
})
export class MinimaxTestingComponent extends AbstractGameComponent<MinimaxTestingMove, MinimaxTestingPartSlice, LegalityStatus> {

    /*************************** Common Fields **************************/

    public rules = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_0);

    public imagesLocation = 'assets/images/';

    public coord: Coord;

    public chooseRight() {
        console.log('chooseRight');
        const chosenMove = MinimaxTestingMove.RIGHT;
        this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public chooseDown() {
        console.log('chooseDown');
        const chosenMove = MinimaxTestingMove.DOWN;
        this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public updateBoard() {
        const slice: MinimaxTestingPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard()
        this.coord = slice.location;
    }
    public decodeMove(encodedMove: number): MinimaxTestingMove {
        return MinimaxTestingMove.decode(encodedMove);
    }
    public encodeMove(move: MinimaxTestingMove): number {
        return move.encode();
    }
}