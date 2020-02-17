import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { SiamMove, SiamMoveNature } from 'src/app/games/siam/SiamMove';
import { SiamPartSlice } from 'src/app/games/siam/SiamPartSlice';
import { SiamLegalityStatus } from 'src/app/games/siam/SiamLegalityStatus';
import { SiamRules } from 'src/app/games/siam/SiamRules';
import { Coord } from 'src/app/jscaip/Coord';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';

@Component({
    selector: 'app-siam',
    templateUrl: './siam.component.html'
})
export class SiamComponent extends AbstractGameComponent<SiamMove, SiamPartSlice, SiamLegalityStatus> {

    public rules: SiamRules = new SiamRules();

    public lastMove: SiamMove;

    public chosenCoord: Coord;

    public chosenMoveNature: number;

    public imagesNames: String[] = ["EMPTY", "WHITE_UP", "WHITE_RIGHT", "WHITE_DOWN", "WHITE_LEFT", "BLACK_UP", "BLACK_RIGHT", "BLACK_DOWN", "BLACK_LEFT", "MOUNTAIN"];

    public updateBoard() {
        const slice: SiamPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.board;
        this.lastMove = this.rules.node.move;
        this.chosenCoord = null;
        this.chosenMoveNature = null;
    }
    public decodeMove(encodedMove: number): SiamMove {
        return SiamMove.decode(encodedMove);
    }
    public encodeMove(move: SiamMove): number {
        return move.encode();
    }
    public isHighlightedCoord(x: number, y: number): boolean {
        const coord: Coord = new Coord(x, y);
        const last: Coord = this.lastMove ? this.lastMove.coord : null;
        return coord.equals(last) ||
               coord.equals(this.chosenCoord);
    }
    public onBoardClick(x: number, y: number) {
        if (this.board[y][x] === SiamPiece.EMPTY.value ||
            this.board[y][x] === SiamPiece.MOUNTAIN.value) {
            this.chosenCoord = null;
            this.chosenMoveNature = null;
        } else {
            this.chosenCoord = new Coord(x, y);
            this.tryMove();
        }
    }
    public insertAt(x: number, y: number) {
        if (this.chosenCoord) {
            this.chosenCoord = null;
        } else {
            this.chosenCoord = new Coord(x, y);
            this.chosenMoveNature = SiamMoveNature.FORWARD.value;
            this.tryMove();
        }
    }
    public onMoveNatureSelection(nature: number) {
        this.chosenMoveNature = nature;
        this.tryMove();
    }
    public tryMove() {
        if (this.chosenCoord && this.chosenMoveNature) {
            const move: SiamMove = new SiamMove(this.chosenCoord.x, this.chosenCoord.y, SiamMoveNature.decode(this.chosenMoveNature));
            this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
            this.chosenCoord = null;
            this.chosenMoveNature = null;
        }
    }
}