import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { ReversiRules } from '../../../games/reversi/reversirules/ReversiRules';
import { ReversiPartSlice } from '../../../games/reversi/ReversiPartSlice';
import { ReversiMove } from 'src/app/games/reversi/reversimove/ReversiMove';
import { ReversiLegalityStatus } from 'src/app/games/reversi/ReversiLegalityStatus';
import { Coord } from 'src/app/jscaip/coord/Coord';

@Component({
    selector: 'app-reversi',
    templateUrl: './reversi.component.html'
})
export class ReversiComponent extends AbstractGameComponent<ReversiMove, ReversiPartSlice, ReversiLegalityStatus> {

    public rules: ReversiRules = new ReversiRules();

    public lastMove: Coord = new Coord(-1, -1);

    public canPass: boolean = false;

    public scores: number[] = [0, 0];

    constructor() {
        super();
        this.showScore = true;
    }
    public async onClick(x: number, y: number): Promise<boolean> {
        this.lastMove = new Coord(-1, -1); // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove = new ReversiMove(x, y);

        return await this.chooseMove(chosenMove, this.rules.node.gamePartSlice, this.scores[0], this.scores [1]);
    }
    public decodeMove(encodedMove: number): ReversiMove {
        return ReversiMove.decode(encodedMove);
    }
    public encodeMove(move: ReversiMove): number {
        return move.encode();
    }
    public updateBoard(): void {
        const slice: ReversiPartSlice = this.rules.node.gamePartSlice;
        const moveCoord: ReversiMove = this.rules.node.move;

        this.board = slice.getCopiedBoard();

        if (moveCoord) this.lastMove = moveCoord.coord;
        else this.lastMove = null;

        this.scores = slice.countScore();
        this.canPass = ReversiRules.playerCanOnlyPass(slice);
    }
    public pass() {
        this.onClick(ReversiMove.pass.coord.x, ReversiMove.pass.coord.y);
    }
}