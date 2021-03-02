import { AbstractGameComponent } from '../../wrapper-components/AbstractGameComponent';
import { Component } from '@angular/core';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { KamisadoBoard } from 'src/app/games/kamisado/KamisadoBoard';
import { KamisadoMove } from 'src/app/games/kamisado/kamisado-move/KamisadoMove';
import { KamisadoPartSlice } from 'src/app/games/kamisado/KamisadoPartSlice';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { KamisadoRules } from 'src/app/games/kamisado/kamisado-rules/KamisadoRules';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';

@Component({
    selector: 'app-kamisado',
    templateUrl: './kamisado.component.html',
})

export class KamisadoComponent extends AbstractGameComponent<KamisadoMove, KamisadoPartSlice, LegalityStatus> {
    public rules: KamisadoRules = new KamisadoRules(KamisadoPartSlice);
    public UNOCCUPIED: number = KamisadoPiece.NONE.getValue();
    public lastMove: KamisadoMove = null;
    public chosen: Coord = new Coord(-1, -1);
    public chosenAutomatically: boolean = false;
    public canPass: boolean = false;

    public styleBackground(x: number, y: number): {[key:string]: string} {
        return {
            fill: KamisadoBoard.getColorAt(x, y).rgb,
        };
    }
    public stylePiece(pieceValue: number): {[key:string]: string} {
        const piece: KamisadoPiece = KamisadoPiece.of(pieceValue);
        return {
            fill: piece.color.rgb,
        };
    }
    public stylePieceBorder(pieceValue: number): {[key:string]: string} {
        const piece: KamisadoPiece = KamisadoPiece.of(pieceValue);
        return {
            fill: this.getPlayerColor(piece.player),
            stroke: 'black',
        };
    }
    public updateBoard(): void {
        const slice: KamisadoPartSlice = this.rules.node.gamePartSlice;
        this.board = slice.getCopiedBoard();
        this.lastMove = this.rules.node.move;

        this.canPass = this.rules.canOnlyPass(slice);
        this.cancelMove();
        if (this.canPass) {
            this.chosenAutomatically = false;
        } else {
            this.chosenAutomatically = true;
            if (slice.coordToPlay.isPresent()) {
                this.chosen = slice.coordToPlay.get();
            } else {
                this.chosen = new Coord(-1, -1);
            }
        }
    }
    public async pass(): Promise<MGPValidation> {
        if (this.canPass) {
            return this.chooseMove(KamisadoMove.PASS, this.rules.node.gamePartSlice, null, null);
        } else {
            // TODO: check use
            return this.cancelMove('Cannot pass.');
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        if (this.chosen.x === -1) {
            return this.choosePiece(x, y);
        } else {
            return await this.chooseDestination(x, y);
        }
    }
    public choosePiece(x: number, y: number): MGPValidation {
        if (this.rules.node.isEndGame()) {
            return this.cancelMove('game is ended');
        }
        const piece: KamisadoPiece = KamisadoBoard.getPieceAt(this.rules.node.gamePartSlice.board, new Coord(x, y));
        const player: Player = this.rules.node.gamePartSlice.getCurrentPlayer();
        if (!piece.belongsTo(player)) {
            return this.cancelMove('piece does not belong to player');
        }
        this.chosen = new Coord(x, y);
        return MGPValidation.SUCCESS;
    }
    private async chooseDestination(x: number, y: number): Promise<MGPValidation> {
        const chosenPiece: Coord = this.chosen;
        const chosenDestination: Coord = new Coord(x, y);
        const move: KamisadoMove = KamisadoMove.of(chosenPiece, chosenDestination);
        return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
    }
    public cancelMoveAttempt(): void {
        if (!this.chosenAutomatically) {
            this.chosen = new Coord(-1, -1);
        }
    }
    public decodeMove(encodedMove: number): KamisadoMove {
        return KamisadoMove.decode(encodedMove);
    }
    public encodeMove(move: KamisadoMove): number {
        return KamisadoMove.encode(move);
    }
}
