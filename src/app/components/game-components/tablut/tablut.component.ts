import {Component} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {Coord} from '../../../jscaip/Coord';
import {TablutMove} from 'src/app/games/tablut/TablutMove';
import {TablutPartSlice} from '../../../games/tablut/TablutPartSlice';
import {TablutRules} from '../../../games/tablut/TablutRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';

@Component({
    selector: 'app-tablut-new',
    templateUrl: './tablut.component.html'
})
export class TablutComponent extends AbstractGameComponent<TablutMove, TablutPartSlice, LegalityStatus> {

    static VERBOSE = false;

    rules = new TablutRules();

    imagesNames: string[] = ['unoccupied.svg', 'king.svg', 'king.svg', 'invaders.svg', 'defender.svg'];

    UNOCCUPIED = 0;

    public moving: Coord = new Coord(-1, -1); // coord of the piece who left

    public arriving: Coord = new Coord(-1, -1);  // coord of the piece who arrived

    public chosen: Coord = new Coord(-1, -1); 

    public updateBoard() {
        const slice: TablutPartSlice = this.rules.node.gamePartSlice;
        const move: TablutMove = this.rules.node.move;
        this.board = slice.getCopiedBoard();

        if (move != null) {
            this.moving = move.coord
            this.arriving = move.end;
        }

        this.cancelMove();
    }
    public onClick(x: number, y: number) {
        if (TablutComponent.VERBOSE) {
            console.log('onClick');
        }
        let success: boolean;
        if (this.chosen.x === -1) {
            success = this.choosePiece(x, y);
        } else {
            success = this.chooseDestination(x, y);
        }
        if (!success) {
            this.cancelMove();
        }
    }
    private chooseDestination(x: number, y: number): boolean {
        if (TablutComponent.VERBOSE) console.log('chooseDestination');

        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        const move: TablutMove = new TablutMove(chosenPiece, chosenDestination);
        return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
    }
    public choosePiece(x: number, y: number): boolean {

        if (TablutComponent.VERBOSE) console.log('choosePiece');

        if (this.rules.node.isEndGame()) {
            if (TablutComponent.VERBOSE) console.log('la partie est finie');
            return false;
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            if (TablutComponent.VERBOSE) console.log('not a piece of the current player');
            return false;
        }

        this.showSelectedPiece(x, y);
        if (TablutComponent.VERBOSE) console.log('selected piece = (' + x + ', ' + y + ')');
        return true;
    }
    public pieceBelongToCurrentPlayer(x: number, y: number): number { // TODO: see that verification is done and refactor this shit
        const player = this.rules.node.gamePartSlice.turn % 2 === 0 ? 0 : 1;
        const invaderStart = this.rules.node.gamePartSlice.invaderStart;
        const coord: Coord = new Coord(x, y);
        return TablutRules.getRelativeOwner(player, invaderStart, coord, this.board);
    }
    public hideLastMove() {
        this.moving = new Coord(-1, -1);
        this.arriving = new Coord(-1, -1);
    }
    public cancelMove() {
        this.chosen = new Coord(-1, -1);
    }
    public isThrone(x: number, y: number): boolean {
        return TablutRules.isThrone(new Coord(x, y));
    }
    public showSelectedPiece(x: number, y: number) {
        this.chosen = new Coord(x, y);
    }
    public decodeMove(encodedMove: number): TablutMove {
        return TablutMove.decode(encodedMove);
    }
    public encodeMove(move: TablutMove): number {
        return move.encode();
    }
}