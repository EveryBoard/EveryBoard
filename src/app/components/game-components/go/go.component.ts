import {Component, OnInit} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../services/UserService';
import {JoinerService} from '../../../services/JoinerService';
import {GameService} from '../../../services/GameService';
import {GoMove} from 'src/app/games/go/GoMove';
import {GoRules} from 'src/app/games/go/GoRules';
import {GoPartSlice, Phase} from 'src/app/games/go/GoPartSlice';
import {Coord} from 'src/app/jscaip/Coord';

@Component({
    selector: 'app-go',
    templateUrl: './go.component.html'
})
export class GoComponent extends AbstractGameComponent {

    static VERBOSE = true;

    rules = new GoRules();

    imagesLocation = 'assets/images/'; // en prod
    // imagesLocation = 'src/assets/images/'; // en dev

    koX = -1;
    koY = -1;

    lastX = -1;
    lastY = -1;
    canPass = false;

    constructor() {
        super();
        this.canPass = true;
        this.showScore = true;
    }

    onClick(x: number, y: number): boolean {
        console.log("salut " + x + "-" + y);
        const goPartSlice = this.rules.node.gamePartSlice as GoPartSlice;
        if (this.rules.node.isEndGame()) {
            if (GoComponent.VERBOSE) {
                console.log('Malheureusement la partie est finie');
            }
            return false;
        }

        this.lastX = -1; this.lastY = -1; // now the user stop try to do a move
        // we stop showing him the last move
        const chosenMove = new GoMove(x, y, []); // TODO: check validity of "[]"
        if (this.rules.isLegal(chosenMove)) {
            if (GoComponent.VERBOSE) {
                console.log('Et javascript estime que votre mouvement est légal');
            }
            // player make a correct move
            // let's confirm on java-server-side that the move is legal
            this.chooseMove(chosenMove, null, null); // TODO: encode score
        } else {
            if (GoComponent.VERBOSE) {
                console.log('Mais c\'est un mouvement illegal');
            }
        }
    }

    decodeMove(encodedMove: number): GoMove {
        return GoMove.decode(encodedMove);
    }

    encodeMove(move: GoMove): number {
        return move.encode();
    }

    updateBoard(): void {
        if (GoComponent.VERBOSE) {
            console.log('updateBoard');
        }
        const slice: GoPartSlice = this.rules.node.gamePartSlice as GoPartSlice;
        const move: GoMove = this.rules.node.move as GoMove;
        const koCoord: Coord = slice.getKoCoordCopy();
        const phase: Phase = slice.phase;

        this.board = slice.getCopiedBoard();

        if (move != null) {
            this.lastX = move.coord.x;
            this.lastY = move.coord.y;
        }
        if (koCoord != null) {
            this.koX = koCoord.x;
            this.koY = koCoord.y;
        } else {
            this.koX = -1;
            this.koY = -1;
        }
        this.canPass = phase !== Phase.COUNTING;
    }

    pass() {
        this.onClick(GoMove.pass.coord.x, GoMove.pass.coord.y);
    }
}