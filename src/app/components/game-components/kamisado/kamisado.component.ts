import {Component} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {Coord} from '../../../jscaip/coord/Coord';
import {KamisadoMove} from 'src/app/games/kamisado/kamisadomove/KamisadoMove';
import {KamisadoBoard, KamisadoColor, KamisadoPartSlice, KamisadoPiece} from 'src/app/games/kamisado/KamisadoPartSlice';
import {KamisadoRules} from 'src/app/games/kamisado/kamisadorules/KamisadoRules';
import {LegalityStatus} from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';

@Component({
    selector: 'app-kamisado-new',
    templateUrl: './kamisado.component.html'
})

export class KamisadoComponent extends AbstractGameComponent<KamisadoMove, KamisadoPartSlice, LegalityStatus> {
    public imagesNames: string[] = ["none", "brown.svg", "green.svg", "red.svg", "yellow.svg", "pink.svg", "purple.svg", "blue.svg", "orange.svg"];

    public rules = new KamisadoRules(false);

    public UNOCCUPIED: number = KamisadoPiece.NONE.getValue();

    public colors = KamisadoBoard.COLORS;

    public moving: Coord = new Coord(-1, -1);

    public end: Coord = new Coord(-1, -1);

    public chosen: Coord = new Coord(-1, -1);

    public backgroundImage(x: number, y: number): string {
        return 'kamisado/background/' + this.colors[y][x].name + '.svg';
    }

    public imageOfContent(content: number): string {
        const piece = KamisadoPiece.of(content);
        return 'kamisado/pieces/' + piece.color.name + piece.player.value + '.svg'; // TODO: distinguish both players
    }

    public updateBoard() {
        const slice: KamisadoPartSlice = this.rules.node.gamePartSlice;
        const move: KamisadoMove = this.rules.node.move;
        this.board = slice.getCopiedBoard();

        if (move != null) {
            this.moving = move.coord;
            this.end = move.end;
        }
        this.cancelMove();
    }

    public async onClick(x: number, y: number): Promise<boolean> {
        console.log("click: " + x+ ","+ y);
        let success: boolean;
        if (this.chosen.x === -1) {
            console.log("choosePiece")
            success = this.choosePiece(x, y);
        } else {
            console.log("chooseDestination")
            success = await this.chooseDestination(x, y);
        }
        if (!success) {
            console.log("no success");
            this.cancelMove();
        }
        console.log("success!");
        return success;
    }

    private async chooseDestination(x: number, y: number): Promise<boolean> {
        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        try {
            const move: KamisadoMove = new KamisadoMove(chosenPiece, chosenDestination);
            return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
        } catch (error) {
            this.cancelMove();
            return false;
        }
    }

    public choosePiece(x: number, y: number): boolean {
        if (this.rules.node.isEndGame()) {
            console.log("isEndGame");
            return false;
        }
        this.hideLastMove();

        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            console.log("!pieceBelongToCurrentPlayer, current player is: " + this.rules.node.gamePartSlice.turn % 2);
            return false;
        }
        this.showSelectedPiece(x, y);
        return true;
    }

    public pieceBelongToCurrentPlayer(x: number, y: number): boolean {
        const player = this.rules.node.gamePartSlice.turn % 2 === 0 ? 0 : 1
        const coord: Coord = new Coord(x, y);
        const piece: number = this.rules.node.gamePartSlice.board[y][x];
        return (piece > 0 && ((player === 0 && piece < 16) || (player === 1) && piece >= 16));
    }
    public hideLastMove() {
        this.moving = new Coord(-1, -1);
        this.end = new Coord(-1, -1);
    }
    public cancelMove() {
        this.chosen = new Coord(-1, -1);
    }
    public showSelectedPiece(x: number, y: number) {
        this.chosen = new Coord(x, y);
    }
    public decodeMove(encodedMove: number): KamisadoMove {
        return KamisadoMove.decode(encodedMove);
    }
    public encodeMove(move: KamisadoMove): number {
        return move.encode();
    }
}