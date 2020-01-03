import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../services/UserService';
import {JoinerService} from '../../../services/JoinerService';
import {GameService} from '../../../services/GameService';
import {Move} from '../../../jscaip/Move';
import {AbstractGameComponent} from '../AbstractGameComponent';
import { MinimaxTestingRules } from 'src/app/games/minimax-testing/MinimaxTestingRules';
import { MinimaxTestingPartSlice } from 'src/app/games/minimax-testing/MinimaxTestingPartSlice';
import { MinimaxTestingMove } from 'src/app/games/minimax-testing/MinimaxTestingMove';
import { Coord } from 'src/app/jscaip/Coord';

@Component({
    selector: 'app-minimax-testing',
    templateUrl: './minimax-testing.component.html',
    styleUrls: []
})
export class MinimaxTestingComponent extends AbstractGameComponent {

    /*************************** Common Fields **************************/

    rules = new MinimaxTestingRules(MinimaxTestingPartSlice.BOARD_0);

    imagesLocation = 'assets/images/';

    coord: Coord;

    chooseRight() {
        console.log('chooseRight');
        const chosenMove = MinimaxTestingMove.RIGHT;
        this.chooseMove(chosenMove, null, null);
    }

    chooseDown() {
        console.log('chooseDown');
        const chosenMove = MinimaxTestingMove.DOWN;
        this.chooseMove(chosenMove, null, null);
    }

    updateBoard() {
        const slice: MinimaxTestingPartSlice = this.rules.node.gamePartSlice as MinimaxTestingPartSlice;
        this.board = slice.getCopiedBoard()
        this.coord = slice.location;
    }

    decodeMove(encodedMove: number): MinimaxTestingMove {
        return MinimaxTestingMove.decode(encodedMove);
    }

    encodeMove(move: MinimaxTestingMove): number {
        return move.encode();
    }
}