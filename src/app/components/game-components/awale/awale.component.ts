import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { AwaleRules } from '../../../games/awale/awale-rules/AwaleRules';
import { AwaleMove } from 'src/app/games/awale/awale-move/AwaleMove';
import { AwalePartSlice } from '../../../games/awale/AwalePartSlice';
import { AwaleLegalityStatus } from 'src/app/games/awale/AwaleLegalityStatus';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

@Component({
    selector: 'app-awale-new-component',
    templateUrl: './awale.component.html',
})
export class AwaleComponent extends AbstractGameComponent<AwaleMove, AwalePartSlice, AwaleLegalityStatus> {
    public rules = new AwaleRules(AwalePartSlice);

    public scores: number[] = [0, 0];

    public last: Coord = new Coord(-1, -1);

    constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.showScore = true;
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        // TODO : option de clonage revision commentage

        this.last = new Coord(-1, -1); // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove: AwaleMove = new AwaleMove(x, y);
        // let's confirm on java-server-side that the move is legal
        return this.chooseMove(chosenMove, this.rules.node.gamePartSlice, this.scores[0], this.scores[1]);
    }
    public cancelMove(reason?: string): void {
        // Empty because not needed.
    }
    public decodeMove(encodedMove: number): AwaleMove {
        return AwaleMove.decode(encodedMove);
    }
    public encodeMove(move: AwaleMove): number {
        return AwaleMove.encode(move);
    }
    public updateBoard(): void {
        const awalePartSlice: AwalePartSlice = this.rules.node.gamePartSlice;
        this.scores = awalePartSlice.getCapturedCopy();
        const awaleMove: AwaleMove = this.rules.node.move;

        if (this.observerRole === 1) {
            const orientedBoard: number[][] = [];
            awalePartSlice.getCopiedBoard().forEach(
                (line) => orientedBoard.push(line.reverse()));
            this.board = orientedBoard;
        } else {
            this.board = awalePartSlice.getCopiedBoard().reverse();
        }

        if (awaleMove != null) {
            this.last = awaleMove.coord;
        }
    }
}
