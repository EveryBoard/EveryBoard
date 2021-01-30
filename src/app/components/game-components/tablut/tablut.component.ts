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
import { Player } from 'src/app/jscaip/player/Player';

@Component({
    selector: 'app-tablut',
    templateUrl: './tablut.component.html',
})
export class TablutComponent extends AbstractGameComponent<TablutMove, TablutPartSlice, LegalityStatus> {
    public static VERBOSE: boolean = false;

    public rules: TablutRules = new TablutRules(TablutPartSlice);

    public imagesNames: string[] = ['unoccupied.svg', 'king.svg', 'king.svg', 'invaders.svg', 'defender.svg']; // TODO: kill that thang
    public throneCoords: Coord[] = [
        new Coord(0, 0),
        new Coord(0, 8),
        new Coord(4, 4),
        new Coord(8, 0),
        new Coord(8, 8),
    ];
    public NONE: number = TablutCase.UNOCCUPIED.value;

    public NORMAL_FILL: string = 'lightgray';

    public CLICKABLE_STYLE: any = {
        stroke: 'yellow',
    };

    public moving: Coord = new Coord(-1, -1); // coord of the piece who left

    public arriving: Coord = new Coord(-1, -1); // coord of the piece who arrived

    public chosen: Coord = new Coord(-1, -1);

    public updateBoard(): void {
        const slice: TablutPartSlice = this.rules.node.gamePartSlice;
        const move: TablutMove = this.rules.node.move;
        this.board = slice.getCopiedBoard();

        if (move) {
            this.moving = move.coord;
            this.arriving = move.end;
        } else {
            this.hideLastMove();
        }
        this.cancelMove();
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        display(TablutComponent.VERBOSE, 'TablutComponent.onClick(' + x + ', ' + y + ')');

        if (this.chosen.x === -1) {
            return this.choosePiece(x, y);
        } else {
            return this.chooseDestination(x, y);
        }
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        display(TablutComponent.VERBOSE, 'TablutComponent.chooseDestination');

        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        let move: TablutMove;
        try {
            move = new TablutMove(chosenPiece, chosenDestination);
        } catch (error) {
            return this.cancelMove(error.message);
        }
        return await this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
    }
    public choosePiece(x: number, y: number): MGPValidation {
        display(TablutComponent.VERBOSE, 'TablutComponent.choosePiece');

        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (this.board[y][x] === TablutCase.UNOCCUPIED.value) {
            return this.cancelMove('Pour votre premier clic, choisissez une de vos pièces.');
        }
        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            return this.cancelMove('Cette pièce ne vous appartient pas.');
        }

        this.showSelectedPiece(x, y);
        display(TablutComponent.VERBOSE, 'selected piece = (' + x + ', ' + y + ')');
        return MGPValidation.SUCCESS;
    }
    public pieceBelongToCurrentPlayer(x: number, y: number): boolean {
        // TODO: see that verification is done and refactor this shit
        const player: Player = this.rules.node.gamePartSlice.getCurrentPlayer();
        const coord: Coord = new Coord(x, y);
        return TablutRules.getRelativeOwner(player, coord, this.board) === TablutRules.PLAYER;
    }
    public hideLastMove(): void {
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
    public showSelectedPiece(x: number, y: number): void {
        this.chosen = new Coord(x, y);
    }
    public decodeMove(encodedMove: number): TablutMove {
        return TablutMove.decode(encodedMove);
    }
    public encodeMove(move: TablutMove): number {
        return move.encode();
    }
    public getPieceStyle(x: number, y: number): any {
        const fill: string = this.getPlayerColor(this.board[y][x]);
        const stroke: string = this.getPieceStroke(x, y);
        return { fill, stroke };
    }
    private getPlayerColor(player: number): string {
        switch (player) {
        case TablutCase.DEFENDERS.value:
        case TablutCase.PLAYER_ONE_KING.value:
        case TablutCase.PLAYER_ZERO_KING.value: return '#ffc34d';
        case TablutCase.INVADERS.value: return '#994d00';
        }
    }
    public getPieceStroke(x: number, y: number): string {
        const coord: Coord = new Coord(x, y);
        if (coord.equals(this.moving) ||
            coord.equals(this.arriving)) {
            return 'blue';
        } else if (this.chosen.equals(coord)) {
            return 'yellow';
        } else {
            return null;
        }
    }
    public getRectFill(x: number, y: number): string {
        // const clicked: Coord = new Coord(x, y);
        // if (this.captureds.some((c: Coord) => c.equals(clicked))) {
        //     return this.CAPTURED_FILL;
        // } else if (this.moveds.some((c: Coord) => c.equals(clicked))) {
        //     return this.MOVED_FILL;
        // } else {
        return this.NORMAL_FILL;
        // }
    }
    public getRectStyle(x: number, y: number): unknown {
        if (this.isClickable(x, y)) {
            return this.CLICKABLE_STYLE;
        } else {
            return null;
        }
    }
    public isClickable(x: number, y: number): boolean {
        // Show if the piece can be clicked
        return this.pieceBelongToCurrentPlayer(x, y);
    }
}
