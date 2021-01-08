import { Component } from '@angular/core';

import { AbstractGameComponent } from '../AbstractGameComponent';
import { Coord } from '../../../jscaip/coord/Coord';
import { TablutMove } from 'src/app/games/tablut/tablutmove/TablutMove';
import { TablutPartSlice } from '../../../games/tablut/TablutPartSlice';
import { TablutRules } from '../../../games/tablut/tablutrules/TablutRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { TablutCase } from 'src/app/games/tablut/tablutrules/TablutCase';
import { display } from 'src/app/collectionlib/utils';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';

@Component({
    selector: 'app-tablut',
    templateUrl: './tablut.component.html'
})
export class TablutComponent extends AbstractGameComponent<TablutMove, TablutPartSlice, LegalityStatus> {

    public static VERBOSE: boolean = false;

    public rules = new TablutRules(TablutPartSlice);

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
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        display(TablutComponent.VERBOSE, "TablutComponent.onClick(" + x + ", " + y + ")");

        if (this.chosen.x === -1) {
            return this.choosePiece(x, y);
        } else {
            return await this.chooseDestination(x, y);
        }
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        display(TablutComponent.VERBOSE, 'TablutComponent.chooseDestination');

        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        try {
            const move: TablutMove = new TablutMove(chosenPiece, chosenDestination);
            return await this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
        } catch (error) {
            return this.cancelMove(error.message);
        }
    }
    public choosePiece(x: number, y: number): MGPValidation {
        display(TablutComponent.VERBOSE, 'TablutComponent.choosePiece');

        if (this.rules.node.isEndGame()) { // TODO: clean, isn't that redondant ?
            return this.cancelMove("Game is ended.");
        } else { // TODO: action double non ?
            display(TablutComponent.VERBOSE, 'la partie est en court');
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            return this.cancelMove("Not a piece of the current player.");
        }

        this.showSelectedPiece(x, y);
        display(TablutComponent.VERBOSE, 'selected piece = (' + x + ', ' + y + ')');
        return MGPValidation.SUCCESS;
    }
    public pieceBelongToCurrentPlayer(x: number, y: number): number { // TODO: see that verification is done and refactor this shit
        const player = this.rules.node.gamePartSlice.turn % 2 === 0 ? 0 : 1;
        const invaderStart = TablutPartSlice.INVADER_START;
        const coord: Coord = new Coord(x, y);
        return TablutRules.getRelativeOwner(player, invaderStart, coord, this.board);
    }
    public hideLastMove() {
        this.moving = new Coord(-1, -1);
        this.arriving = new Coord(-1, -1);
    }
    public cancelMove(reason?: string): MGPValidation {
        this.chosen = new Coord(-1, -1);
        if (reason) {
            this.message(reason);
            return MGPValidation.failure(reason);
        } else {
            return MGPValidation.SUCCESS;
        }
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
