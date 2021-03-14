import { Component } from '@angular/core';
import { P4PartSlice } from '../../../games/p4/P4PartSlice';
import { P4Rules } from '../../../games/p4/p4-rules/P4Rules';
import { Move } from '../../../jscaip/Move';
import { AbstractGameComponent } from '../../wrapper-components/AbstractGameComponent';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { P4Move } from 'src/app/games/p4/P4Move';
import { Player } from 'src/app/jscaip/player/Player';

@Component({
    selector: 'app-p4',
    templateUrl: './p4.component.html',
})
export class P4Component extends AbstractGameComponent<P4Move, P4PartSlice, LegalityStatus> {
    public static VERBOSE: boolean = false;

    public EMPTY_CASE: number = Player.NONE.value;
    public CASE_SIZE: number = 50;
    public rules: P4Rules = new P4Rules(P4PartSlice);
    private lastX: number;

    public async onClick(x: number): Promise<MGPValidation> {
        console.log(x);
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const chosenMove: P4Move = P4Move.of(x);
        return await this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null);
    }
    public updateBoard(): void {
        const p4PartSlice: P4PartSlice = this.rules.node.gamePartSlice;
        const lastMove: P4Move = this.rules.node.move;

        this.board = p4PartSlice.getCopiedBoard().reverse();
        if (lastMove !== null) {
            this.lastX = lastMove.x;
        } else {
            this.lastX = null;
        }
    }
    public getCaseStyle(x: number, y: number): {[key:string]: string} {
        return {
            'stroke-width': '2',
            'fill': this.getCaseFill(this.board[y][x]),
            'stroke': this.lastX === x ? 'yellow' : 'black',
        };
    }
    private getCaseFill(content: number): string {
        if (content === Player.NONE.value) {
            return 'none';
        } else {
            return this.getPlayerColor(Player.of(content));
        }
    }
    public decodeMove(encodedMove: number): Move {
        return P4Move.decode(encodedMove);
    }
    public encodeMove(move: P4Move): number {
        return P4Move.encode(move);
    }
}
