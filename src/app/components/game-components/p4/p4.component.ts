import { Component } from '@angular/core';
import { P4PartSlice } from '../../../games/p4/P4PartSlice';
import { MoveX } from '../../../jscaip/MoveX';
import { P4Rules } from '../../../games/p4/p4rules/P4Rules';
import { Move } from '../../../jscaip/Move';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { display } from 'src/app/collectionlib/utils';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';

@Component({
    selector: 'app-p4',
    templateUrl: './p4.component.html'
})
export class P4Component extends AbstractGameComponent<MoveX, P4PartSlice, LegalityStatus> {

    /*************************** Common Fields **************************/

    public static VERBOSE: boolean = false;

    public rules = new P4Rules(P4PartSlice);

    public imagesNames: string[] = ['yellow_circle.svg.png', 'brown_circle.svg.png', 'empty_circle.svg', ];

    public lastX: number;

    public async onClick(x: number): Promise<MGPValidation> {
        const chosenMove = MoveX.get(x);
        const legal: MGPValidation = await this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
        display(P4Component.VERBOSE, "Move " + chosenMove.toString() + " was " + (legal.isSuccess() ? 'legal' : 'illegal'));
        return legal.onFailure(this.message);
    }
    public updateBoard() {
        const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
        const lastMove: MoveX = this.rules.node.move;

        this.board = p4PartSlice.getCopiedBoard().reverse();
        if (lastMove !== null) {
            this.lastX = lastMove.x;
        } else{
            this.lastX = null;
        }
    }
    public decodeMove(encodedMove: number): Move {
        return MoveX.decode(encodedMove);
    }
    public encodeMove(move: MoveX): number {
        return MoveX.encode(move);
    }
}
