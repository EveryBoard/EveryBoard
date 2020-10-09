import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { KamisadoMove } from 'src/app/games/kamisado/kamisadomove/KamisadoMove';
import { KamisadoPartSlice } from 'src/app/games/kamisado/KamisadoPartSlice';
import { KamisadoRules } from 'src/app/games/kamisado/kamisadorules/KamisadoRules';
import { KamisadoBoard } from 'src/app/games/kamisado/KamisadoBoard';
import { KamisadoColor } from 'src/app/games/kamisado/KamisadoColor';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { Player } from 'src/app/jscaip/Player';

@Component({
    selector: 'app-kamisado-new',
    templateUrl: './kamisado.component.html'
})

export class KamisadoComponent extends AbstractGameComponent<KamisadoMove, KamisadoPartSlice, LegalityStatus> {
    public imagesNames: string[] = ["none", "brown.svg", "green.svg", "red.svg", "yellow.svg", "pink.svg", "purple.svg", "blue.svg", "orange.svg"];

    public rules = new KamisadoRules(KamisadoPartSlice.getStartingSlice());

    public UNOCCUPIED: number = KamisadoPiece.NONE.getValue();

    public colors = KamisadoBoard.COLORS;

    public lastMove: KamisadoMove = null;

    public chosen: Coord = new Coord(-1, -1);

    public chosenAutomatically: boolean = false;

    public canOnlyPass: boolean = false;

    public styleBackground(x: number, y: number): any {
        return {
            fill: this.colors[y][x].rgb,
            stroke: 'black',
            'stroke-width': '1px',
        };
    }

    public stylePiece(pieceValue: number): any {
        const piece: KamisadoPiece = KamisadoPiece.of(pieceValue);
        return {
            fill: piece.color.rgb,
            stroke: piece.belongsTo(Player.ONE) ? 'black' : 'white',
            'stroke-width': '15px',
        };
    }

    public updateBoard() {
        const slice: KamisadoPartSlice = this.rules.node.gamePartSlice;
        const move: KamisadoMove = this.rules.node.move;
        this.board = slice.getCopiedBoard();
        this.lastMove = move;

        this.canOnlyPass = this.rules.canOnlyPass(slice);
        this.cancelMove();
        if (!this.canOnlyPass) {
            this.chosenAutomatically = true;
            this.chosen = slice.coordToPlay.get();
        } else {
            this.chosenAutomatically = false;
        }
    }

    public async pass(): Promise<boolean> {
        if (this.canOnlyPass) {
            const move: KamisadoMove = KamisadoMove.PASS;
            return this.chooseMove(KamisadoMove.PASS, this.rules.node.gamePartSlice, null, null);
        }
        return false;
    }

    public async onClick(x: number, y: number): Promise<boolean> {
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
            return false;
        }

        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            return false;
        }
        this.showSelectedPiece(x, y);
        return true;
    }

    public pieceBelongToCurrentPlayer(x: number, y: number): boolean {
        const player = this.rules.node.gamePartSlice.getCurrentPlayer();
        const piece = this.rules.node.gamePartSlice.getPieceAt(x, y);
        return piece.player === player;
    }
    public cancelMove() {
        console.log({auto: this.chosenAutomatically})
        if (!this.chosenAutomatically)
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