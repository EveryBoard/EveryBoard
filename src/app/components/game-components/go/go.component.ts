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
import { GoLegalityStatus } from 'src/app/games/go/GoLegalityStatus';

@Component({
    selector: 'app-go',
    templateUrl: './go.component.html'
})
export class GoComponent extends AbstractGameComponent<GoMove, GoPartSlice, GoLegalityStatus> {

    static VERBOSE = false;

    scores: number[] = [0, 0];

    public rules = new GoRules();

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

    onClick(x: number, y: number) {
        console.log("salut " + x + "-" + y);
        this.lastX = -1; this.lastY = -1; // now the user stop try to do a move
        // we stop showing him the last move
        const resultlessMove: GoMove = new GoMove(x, y, []); // TODO: check validity of "[]"
        const result: boolean = this.chooseMove(resultlessMove, this.rules.node.gamePartSlice, this.scores[0], this.scores[1]); // TODO: encode score
        console.log("this.chooseMove said : " + result);
    }

    decodeMove(encodedMove: number): GoMove {
        return GoMove.decode(encodedMove);
    }

    encodeMove(move: GoMove): number {
        return move.encode();
    }

    public updateBoard(): void {
        if (GoComponent.VERBOSE || true) {
            console.log('updateBoard');
        }
        const slice: GoPartSlice = this.rules.node.gamePartSlice;
        const move: GoMove = this.rules.node.move;
        const koCoord: Coord = slice.koCoord;
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