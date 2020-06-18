import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { SiamMove, SiamMoveNature } from 'src/app/games/siam/siammove/SiamMove';
import { SiamPartSlice } from 'src/app/games/siam/SiamPartSlice';
import { SiamLegalityStatus } from 'src/app/games/siam/SiamLegalityStatus';
import { SiamRules } from 'src/app/games/siam/siamrules/SiamRules';
import { Coord } from 'src/app/jscaip/Coord';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';

@Component({
    selector: 'app-siam',
    templateUrl: './siam.component.html'
})
export class SiamComponent extends AbstractGameComponent<SiamMove, SiamPartSlice, SiamLegalityStatus> {

    public static VERBOSE: boolean = false;

    public rules: SiamRules = new SiamRules();

    public lastMove: SiamMove;

    public chosenCoord: Coord;

    public chosenMoveNature: number;

    public imagesNames: String[] = ["EMPTY", "WHITE_UP", "WHITE_RIGHT", "WHITE_DOWN", "WHITE_LEFT", "BLACK_UP", "BLACK_RIGHT", "BLACK_DOWN", "BLACK_LEFT", "MOUNTAIN"];

    public updateBoard() {
        if (SiamComponent.VERBOSE) console.log("SiamComponent.updateBoard");

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
    public onBoardClick(x: number, y: number): boolean {
        if (SiamComponent.VERBOSE) console.log("SiamComponent.onBoardClick(" + x + ", " + y + ")");

        if (this.board[y][x] === SiamPiece.EMPTY.value ||
            this.board[y][x] === SiamPiece.MOUNTAIN.value) {
            this.chosenCoord = null;
            this.chosenMoveNature = null;
            if (SiamComponent.VERBOSE) console.log("Can't click empty piece or mountain");
            return false;
        } else {
            this.chosenCoord = new Coord(x, y);
            return true;
        }
    }
    public insertAt(x: number, y: number): boolean {
        if (SiamComponent.VERBOSE) console.log("SiamComponent.insertAt(" + x + ", " + y + ")");

        if (this.chosenCoord) {
            this.chosenCoord = null;
            return false;
        } else {
            this.chosenCoord = new Coord(x, y);
            this.chosenMoveNature = SiamMoveNature.FORWARD.value;
            return this.tryMove();
        }
    }
    public onMoveNatureSelection(nature: number): boolean {
        if (SiamComponent.VERBOSE) console.log("SiamComponent.onMoveNatureSelection(" + nature + ")");
        this.chosenMoveNature = nature;
        return this.tryMove();
    }
    public tryMove(): boolean {
        if (this.chosenCoord != null && this.chosenMoveNature != null) {
            const nature: SiamMoveNature = SiamMoveNature.decode(this.chosenMoveNature);
            const move: SiamMove = new SiamMove(this.chosenCoord.x, this.chosenCoord.y, nature);
            this.chosenCoord = null;
            this.chosenMoveNature = null;
            const legal: boolean = this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
            if (SiamComponent.VERBOSE) console.log("SiamComponent.tryMove: " + legal);
            return legal;
        } else {
            if (SiamComponent.VERBOSE) console.log("SiamComponent.tryMove: can't try move when chosenCoord or chosenMoveNature missing");
            return false;
        }
    }
}