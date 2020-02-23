import {Component} from '@angular/core';
import {P4PartSlice} from '../../../games/p4/P4PartSlice';
import {MoveX} from '../../../jscaip/MoveX';
import {P4Rules} from '../../../games/p4/P4Rules';
import {Move} from '../../../jscaip/Move';
import {AbstractGameComponent} from '../AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

@Component({
    selector: 'app-p4-new',
    templateUrl: './p4.component.html',
    styleUrls: []
})
export class P4Component extends AbstractGameComponent<MoveX, P4PartSlice, LegalityStatus> {

    /*************************** Common Fields **************************/

    public rules = new P4Rules();

    public imagesNames: string[] = ['yellow_circle.svg.png', 'brown_circle.svg.png', 'empty_circle.svg', ];

    public lastX: number;

    public onClick(x: number) {
        console.log('click');
        const chosenMove = MoveX.get(x);
        this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public updateBoard() {
        const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
        const lastMove: MoveX = this.rules.node.move;

        this.board = p4PartSlice.getCopiedBoard().reverse();
        if (lastMove !== null) {
            this.lastX = lastMove.x;
        }
    }
    public decodeMove(encodedMove: number): Move {
        return MoveX.get(encodedMove);
    }
    public encodeMove(move: MoveX): number {
        return move.x;
    }
}