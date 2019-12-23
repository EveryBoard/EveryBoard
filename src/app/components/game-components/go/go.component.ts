import {Component, OnInit} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../services/UserService';
import {JoinerService} from '../../../services/JoinerService';
import {GameService} from '../../../services/GameService';
import {MoveCoord} from '../../../jscaip/MoveCoord';
import { GoRules } from 'src/app/games/go/GoRules';
import { GoPartSlice } from 'src/app/games/go/GoPartSlice';
import { Coord } from 'src/app/jscaip/Coord';

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
        const chosenMove = new MoveCoord(x, y);
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

    decodeMove(encodedMove: number): MoveCoord {
        if (encodedMove === GoRules.passNumber) {
            return GoRules.pass;
        }
        const x = encodedMove % 19; // TODO: vérifier ici le cas où ce sera pas un plateau de taille standard 19x19
        const y = (encodedMove - x) / 19;
        return new MoveCoord(x, y);
    }

    encodeMove(move: MoveCoord): number {
        // A go move goes on x from o to 18
        // and y from 0 to 18
        // encoded as y*18 + x
        if (move.equals(GoRules.pass)) {
            return GoRules.passNumber;
        }
        return (move.coord.y * 19) + move.coord.x;
    }

    updateBoard(): void {
        if (GoComponent.VERBOSE) {
            console.log('updateBoard');
        }
        const goPartSlice: GoPartSlice = this.rules.node.gamePartSlice as GoPartSlice;
        const moveCoord: MoveCoord = this.rules.node.getMove() as MoveCoord;
        const koCoord: Coord = goPartSlice.getKoCoordCopy();

        this.board = goPartSlice.getCopiedBoard();

        if (moveCoord != null) {
            this.lastX = moveCoord.coord.x;
            this.lastY = moveCoord.coord.y;
        }
        if (koCoord != null) {
            this.koX = koCoord.x;
            this.koY = koCoord.y;
        } else {
            this.koX = -1;
            this.koY = -1;
        }
    }

    pass() {
        this.onClick(GoRules.pass.coord.x, GoRules.pass.coord.y);
    }
}