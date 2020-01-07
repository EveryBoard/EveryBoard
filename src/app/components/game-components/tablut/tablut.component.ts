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

    imagesLocation = 'assets/images/'; // en prod';
    // imagesLocation = 'src/assets/images/'; // en dev
    imagesNames: string[] = ['unoccupied.svg', 'king.svg', 'king.svg', 'invaders.svg', 'defender.svg'];
    UNOCCUPIED = 0;

    movingX = -1; // coord of the piece who left
    movingY = -1;
    arrivingX = -1; // coord of the piece who arrived
    arrivingY = -1;
    chosenX = -1;
    chosenY = -1;

    updateBoard() {
        const slice: TablutPartSlice = this.rules.node.gamePartSlice;
        const move: TablutMove = this.rules.node.move;
        this.board = slice.getCopiedBoard();
        // this.turn = tablutPartSlice.turn;
        // this.currentPlayer = this.players[tablutPartSlice.turn % 2];

        if (move != null) {
            this.movingX = move.coord.x;
            this.movingY = move.coord.y;
            this.arrivingX = move.end.x;
            this.arrivingY = move.end.y;
        }

        this.cancelMove();
    }

    onClick(x: number, y: number) {
        if (TablutComponent.VERBOSE) {
            console.log('onClick');
        }
        let success: boolean;
        if (this.chosenX === -1) {
            success = this.choosePiece(x, y);
        } else {
            success = this.chooseDestination(x, y);
        }
        if (!success) {
            this.cancelMove();
        }
    }

    chooseDestination(x: number, y: number): boolean {

        if (TablutComponent.VERBOSE) {
            console.log('chooseDestination');
        }
        if (this.rules.node.isEndGame()) {
            if (TablutComponent.VERBOSE) {
                console.log('la partie est finie');
            }
            return false;
        } // TODO : refactor ça avec chooseCoord
        if (this.chosenX === -1) {
            if (TablutComponent.VERBOSE) {
                console.log('choisis une pièce d\'abord');
            }
            return false;
        } // TODO : vérifier au moins que la case n'est pas occupée
        if (TablutComponent.VERBOSE) {
            console.log('piece choisie, partie en cours, c\'est ton tour');
        }
        const chosenPiece: Coord = new Coord(this.chosenX, this.chosenY);
        const chosenDestination: Coord = new Coord(x, y);
        const move: TablutMove = new TablutMove(chosenPiece, chosenDestination, []); // TODO: check "[]"
        return this.chooseMove(move, this.rules.node.gamePartSlice, null, null);
    }

    choosePiece(x, y): boolean {

        if (TablutComponent.VERBOSE) {
            console.log('choosePiece');
        }
        // if (!this.isPlayerTurn()) {
        //  console.log('ce n\'est pas ton tour!');
        //  return false;
        // }
        // console.log('c\'est ton tour');
        if (this.rules.node.isEndGame()) {
            if (TablutComponent.VERBOSE) {
                console.log('la partie est finie');
            }
            return false;
        }
        this.hideLastMove(); // now the user tried to choose something
        // so I guess he don't need to see what's the last move of the opponent

        if (!this.pieceBelongToCurrentPlayer(x, y)) {
            if (TablutComponent.VERBOSE) {
                console.log('not a piece of the current player');
            }
            return false;
        }

        this.showSelectedPiece(x, y);
        if (TablutComponent.VERBOSE) {
            console.log('selected piece = (' + x + ', ' + y + ')');
        }
        return true;
    }

    pieceBelongToCurrentPlayer(x: number, y: number): number { // TODO: see that verification is done and refactor this shit
        const player = this.rules.node.gamePartSlice.turn % 2 === 0 ? 0 : 1;
        const invaderStart = this.rules.node.gamePartSlice.invaderStart;
        const coord: Coord = new Coord(x, y);
        return TablutRules.getRelativeOwner(player, invaderStart, coord, this.board);
    }

    hideLastMove() {
        this.movingX = -1;
        this.movingY = -1;
        this.arrivingX = -1;
        this.arrivingY = -1;
    }

    cancelMove() {
        this.chosenX = -1;
        this.chosenY = -1;
    }

    isThrone(x: number, y: number): boolean {
        return TablutRules.isThrone(new Coord(x, y));
    }

    showSelectedPiece(x: number, y: number) {
        this.chosenX = x;
        this.chosenY = y;
    }

    decodeMove(encodedMove: number): TablutMove {
        return TablutMove.decode(encodedMove);
    }

    encodeMove(move: TablutMove): number {
        return move.encode();
    }
}