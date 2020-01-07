import {Component, OnInit} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {ReversiRules} from '../../../games/reversi/ReversiRules';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../services/UserService';
import {JoinerService} from '../../../services/JoinerService';
import {GameService} from '../../../services/GameService';
import {ReversiPartSlice} from '../../../games/reversi/ReversiPartSlice';
import { ReversiMove } from 'src/app/games/reversi/ReversiMove';
import { ReversiLegalityStatus } from 'src/app/games/reversi/ReversiLegalityStatus';

@Component({
    selector: 'app-reversi',
    templateUrl: './reversi.component.html'
})
export class ReversiComponent extends AbstractGameComponent<ReversiMove, ReversiPartSlice, ReversiLegalityStatus> {

    static VERBOSE = false;

    rules = new ReversiRules();

    imagesLocation = 'assets/images/'; // en prod
    // imagesLocation = 'src/assets/images/'; // en dev

    lastX = -1;
    lastY = -1;
    canPass = false;

    onClick(x: number, y: number): boolean {
        const reversiPartSlice = this.rules.node.gamePartSlice;
        if (ReversiComponent.VERBOSE) {
            console.log('ReversiRules.getListMoves(reversiPartSlice): ');
            console.log(ReversiRules.getListMoves(reversiPartSlice));
            console.log('this.rules.getListMoves(this.rules.node): ');
            console.log(this.rules.getListMoves(this.rules.node));
            console.log('f9 0 board value : ' + this.rules.node.ownValue);
        }
        if (this.rules.node.isEndGame()) {
            if (ReversiComponent.VERBOSE) {
                console.log('Malheureusement la partie est finie');
            }
            return false;
        }

        if (ReversiComponent.VERBOSE) {
            console.log('vous tentez un mouvement en (' + x + ', ' + y + ')');
        }

        this.lastX = -1; this.lastY = -1; // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove = new ReversiMove(x, y);
        if (this.rules.isLegal(chosenMove)) {
            if (ReversiComponent.VERBOSE) {
                console.log('Et javascript estime que votre mouvement est légal');
            }
            // player make a correct move
            // let's confirm on java-server-side that the move is legal
            this.chooseMove(chosenMove, this.rules.node.gamePartSlice, null, null); // TODO: encode score
        } else {
            if (ReversiComponent.VERBOSE) {
                console.log('Mais c\'est un mouvement illegal');
            }
        }
    }

    decodeMove(encodedMove: number): ReversiMove {
        return ReversiMove.decode(encodedMove);
    }

    encodeMove(move: ReversiMove): number {
        return move.encode();
    }

    updateBoard(): void {
        if (ReversiComponent.VERBOSE) {
            console.log('updateBoard');
        }
        const reversiPartSlice: ReversiPartSlice = this.rules.node.gamePartSlice;
        const moveCoord: ReversiMove = this.rules.node.move;

        this.board = reversiPartSlice.getCopiedBoard();

        if (moveCoord != null) {
            this.lastX = moveCoord.coord.x;
            this.lastY = moveCoord.coord.y;
        }
        if (ReversiComponent.VERBOSE) {
            console.log('f9 choices : ' + JSON.stringify(ReversiRules.getListMoves(reversiPartSlice)));
        }
        if (ReversiComponent.VERBOSE) {
            console.log('f9 board value : ' + this.rules.node.ownValue);
        }
        if (ReversiRules.playerCanOnlyPass(reversiPartSlice)) { // && (!this.endGame)
            if (ReversiComponent.VERBOSE) {
                console.log('f9 l\'utilisateur ne peut que passer son tour!');
            }
            this.canPass = true;
        } else {
            if (ReversiComponent.VERBOSE) {
                console.log('f9 they pretend that you have choices, is it true');
            }
            this.canPass = false;
        }
    }

    pass() {
        this.onClick(ReversiMove.pass.coord.x, ReversiMove.pass.coord.y);
    }
}