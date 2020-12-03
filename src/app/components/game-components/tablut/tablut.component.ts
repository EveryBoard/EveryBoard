import { Component } from '@angular/core';

import { AbstractGameComponent } from '../AbstractGameComponent';
import { Coord } from '../../../jscaip/coord/Coord';
import { TablutMove } from 'src/app/games/tablut/tablutmove/TablutMove';
import { TablutPartSlice } from '../../../games/tablut/TablutPartSlice';
import { TablutRules } from '../../../games/tablut/tablutrules/TablutRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { TablutCase } from 'src/app/games/tablut/tablutrules/TablutCase';
import { display } from 'src/app/collectionlib/utils';

@Component({
    selector: 'app-tablut-new',
    templateUrl: './tablut.component.html'
})
export class TablutComponent extends AbstractGameComponent<TablutMove, TablutPartSlice, LegalityStatus> {

    public static VERBOSE: boolean = false;

    public rules = new TablutRules();

    public imagesNames: string[] = ['unoccupied.svg', 'king.svg', 'king.svg', 'invaders.svg', 'defender.svg'];

    public UNOCCUPIED: number = TablutCase.UNOCCUPIED.value;

    public moving: Coord = new Coord(-1, -1); // coord of the piece who left

    public arriving: Coord = new Coord(-1, -1); // coord of the piece who arrived

    public chosen: Coord = new Coord(-1, -1);

    public updateBoard() {
        const slice: TablutPartSlice = this.rules.node.gamePartSlice;
        const move: TablutMove = this.rules.node.move;
        this.board = slice.getCopiedBoard();

        if (move) {
            this.moving = move.coord;
            this.arriving = move.end;
        } else {
            this.moving = null;
            this.arriving = null;
        }

        this.cancelMove();
    }
    public async onClick(x: number, y: number): Promise<boolean> {
        display(TablutComponent.VERBOSE, "TablutComponent.onClick(" + x + ", " + y + ")");

        let success: boolean;
        if (this.chosen.x === -1) {
            success = this.choosePiece(x, y);
        } else {
            success = await this.chooseDestination(x, y);
        }
        if (!success) {
            this.cancelMove();
        }
        return success;
    }
    private async chooseDestination(x: number, y: number): Promise<boolean> {
        display(TablutComponent.VERBOSE, 'TablutComponent.chooseDestination');

        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        try {
            const move: TablutMove = new TablutMove(chosenPiece, chosenDestination);
            return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
        } catch (error) {
            this.cancelMove();
            return false;
        }
    }
    public choosePiece(x: number, y: number): boolean {
        display(TablutComponent.VERBOSE, 'TablutComponent.choosePiece');

        if (this.rules.node.isEndGame()) {
            display(TablutComponent.VERBOSE, 'la partie est finie');
            return false;
        } else { // TODO: action double non ?
            display(TablutComponent.VERBOSE, 'la partie est en court');
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            display(TablutComponent.VERBOSE, 'not a piece of the current player');
            return false;
        }

        this.showSelectedPiece(x, y);
        display(TablutComponent.VERBOSE, 'selected piece = (' + x + ', ' + y + ')');
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