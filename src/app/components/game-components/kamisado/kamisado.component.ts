import { AbstractGameComponent } from '../AbstractGameComponent';
import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { KamisadoBoard } from 'src/app/games/kamisado/KamisadoBoard';
import { KamisadoMove } from 'src/app/games/kamisado/kamisadomove/KamisadoMove';
import { KamisadoPartSlice } from 'src/app/games/kamisado/KamisadoPartSlice';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { KamisadoRules } from 'src/app/games/kamisado/kamisadorules/KamisadoRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';

@Component({
    selector: 'app-kamisado',
    templateUrl: './kamisado.component.html'
})

export class KamisadoComponent extends AbstractGameComponent<KamisadoMove, KamisadoPartSlice, LegalityStatus> {
    public rules = new KamisadoRules(KamisadoPartSlice.getStartingSlice());

    public UNOCCUPIED: number = KamisadoPiece.NONE.getValue();

    public lastMove: KamisadoMove = null;

    public chosen: Coord = new Coord(-1, -1);

    public chosenAutomatically: boolean = false;

    public canPass: boolean = false;

    public styleBackground(x: number, y: number): any {
        return {
            fill: KamisadoBoard.getColorAt(x, y).rgb,
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
        this.board = slice.getCopiedBoard();
        this.lastMove = this.rules.node.move;

        this.canPass = KamisadoRules.canOnlyPass(slice);
        this.cancelMove();
        if (this.canPass) {
            this.chosenAutomatically = false;
        } else {
            this.chosenAutomatically = true;
            this.chosen = slice.coordToPlay.get();
        }
    }

    public async pass(): Promise<boolean> {
        if (this.canPass) {
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

    public choosePiece(x: number, y: number): boolean {
        if (this.rules.node.isEndGame()) {
            return false;
        }
        if (!this.rules.node.gamePartSlice.pieceBelongToCurrentPlayer(x, y)) {
            return false;
        }
        this.chosen = new Coord(x, y);
        return true;
    }

    private async chooseDestination(x: number, y: number): Promise<boolean> {
        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        const move: KamisadoMove = new KamisadoMove(chosenPiece, chosenDestination);
        return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
    }


    public cancelMove() {
        if (!this.chosenAutomatically)
            this.chosen = new Coord(-1, -1);
    }

    public decodeMove(encodedMove: number): KamisadoMove {
        return KamisadoMove.decode(encodedMove);
    }

    public encodeMove(move: KamisadoMove): number {
        return KamisadoMove.encode(move);
    }
}
