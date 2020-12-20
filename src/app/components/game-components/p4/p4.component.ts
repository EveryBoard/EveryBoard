import { Component } from '@angular/core';
import { P4PartSlice } from '../../../games/p4/P4PartSlice';
import { P4Rules } from '../../../games/p4/p4rules/P4Rules';
import { Move } from '../../../jscaip/Move';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';
import { P4Move } from 'src/app/games/p4/P4Move';

@Component({
    selector: 'app-p4',
    templateUrl: './p4.component.html'
})
export class P4Component extends AbstractGameComponent<P4Move, P4PartSlice, LegalityStatus> {

    /*************************** Common Fields **************************/

    public static VERBOSE: boolean = false;

    public rules = new P4Rules(P4PartSlice);

    public imagesNames: string[] = ['yellow_circle.svg.png', 'brown_circle.svg.png', 'empty_circle.svg', ];

    public lastX: number;

    public async onClick(x: number): Promise<MGPValidation> {
        const chosenMove = P4Move.of(x);
        return await this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public updateBoard() {
        const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
        const lastMove: P4Move = this.rules.node.move;

        this.board = p4PartSlice.getCopiedBoard().reverse();
        if (lastMove !== null) {
            this.lastX = lastMove.x;
        } else {
            this.lastX = null;
        }
    }
    public decodeMove(encodedMove: number): Move {
        return P4Move.decode(encodedMove);
    }
    public encodeMove(move: P4Move): number {
        return P4Move.encode(move);
    }
}
