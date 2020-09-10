import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { SiamMove } from 'src/app/games/siam/siammove/SiamMove';
import { SiamPartSlice } from 'src/app/games/siam/SiamPartSlice';
import { SiamLegalityStatus } from 'src/app/games/siam/SiamLegalityStatus';
import { SiamRules } from 'src/app/games/siam/siamrules/SiamRules';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { SiamPiece } from 'src/app/games/siam/SiamPiece';
import { Orthogonale } from 'src/app/jscaip/DIRECTION';

@Component({
    selector: 'app-siam',
    templateUrl: './siam.component.html'
})
export class SiamComponent extends AbstractGameComponent<SiamMove, SiamPartSlice, SiamLegalityStatus> {

    public static VERBOSE: boolean = false;

    public rules: SiamRules = new SiamRules();

    public lastMove: SiamMove;

    public chosenCoord: Coord;

    public chosenDirection: Orthogonale;

    public chosenOrientation: Orthogonale;

    public imagesNames: String[] = ["EMPTY", "WHITE_UP", "WHITE_RIGHT", "WHITE_DOWN", "WHITE_LEFT", "BLACK_UP", "BLACK_RIGHT", "BLACK_DOWN", "BLACK_LEFT", "MOUNTAIN"];

    public updateBoard() {
        const slice: SiamPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.board;
        this.lastMove = this.rules.node.move;
    }
    public cancelMove(reason: string): boolean {
        AbstractGameComponent.display(SiamComponent.VERBOSE, reason);
        this.chosenCoord = null;
        this.chosenDirection = null;
        this.chosenOrientation = null;
        return false;
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
        AbstractGameComponent.display(SiamComponent.VERBOSE, "SiamComponent.onBoardClick(" + x + ", " + y + ")");

        if (this.board[y][x] === SiamPiece.EMPTY.value ||
            this.board[y][x] === SiamPiece.MOUNTAIN.value) {
            return this.cancelMove("Can't click on empty piece or mountain");
        } else {
            this.chosenCoord = new Coord(x, y);
            return true;
        }
    }
    public chooseDirection(direction: number): boolean {
        AbstractGameComponent.display(SiamComponent.VERBOSE, "SiamComponent.chooseDirection(" + direction + ")");
        if (this.chosenCoord == null) {
            return this.cancelMove("Can't choose direction before choosing piece to move");
        }
        this.chosenDirection = direction === 0 ? null : Orthogonale.fromInt(direction);
        return true;
    }
    public async chooseOrientation(orientation: number): Promise<boolean> {
        AbstractGameComponent.display(SiamComponent.VERBOSE, "SiamComponent.chooseOrientation(" + orientation + ")");
        if (this.chosenCoord == null) {
            return this.cancelMove("Can't choose orientation before choosing piece to move");
        }
        this.chosenOrientation = Orthogonale.fromInt(orientation);
        return this.tryMove();
    }
    public async insertAt(x: number, y: number): Promise<boolean> {
        AbstractGameComponent.display(SiamComponent.VERBOSE, "SiamComponent.insertAt(" + x + ", " + y + ")");

        if (this.chosenCoord) {
            return this.cancelMove("Can't insert when there is already a selected piece");
        } else {
            this.chosenCoord = new Coord(x, y);
            this.chosenDirection = SiamRules.getCoordDirection(x, y, this.rules.node.gamePartSlice);
            return true;
        }
    }
    public async tryMove(): Promise<boolean> {
        if (this.chosenCoord == null || this.chosenOrientation == null) {
            return this.cancelMove("Can't try move when chosenCoord or chosenOrientation missing");
        }
        const move: SiamMove = new SiamMove(this.chosenCoord.x,
                                            this.chosenCoord.y,
                                            this.chosenDirection,
                                            this.chosenOrientation);
        this.cancelMove("Hiding move before submitting it");
        const legal: boolean = await this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
        AbstractGameComponent.display(SiamComponent.VERBOSE, "SiamComponent.tryMove: " + legal);
        return legal;
    }
}