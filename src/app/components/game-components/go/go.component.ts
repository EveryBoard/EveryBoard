import {Component} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
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

    public static VERBOSE: boolean = false;

    public scores: number[] = [0, 0];

    public rules = new GoRules();

    public koX = -1;
    public koY = -1;

    public lastX = -1;
    public lastY = -1;
    public canPass = false;

    constructor() {
        super();
        this.canPass = true;
        this.showScore = true;
    }

    public onClick(x: number, y: number): boolean {
        if (GoComponent.VERBOSE) console.log("salut " + x + "-" + y);
        this.lastX = -1; this.lastY = -1; // now the user stop try to do a move
        // we stop showing him the last move
        const resultlessMove: GoMove = new GoMove(x, y);
        const result: boolean = this.chooseMove(resultlessMove, this.rules.node.gamePartSlice, this.scores[0], this.scores[1]);
        if (GoComponent.VERBOSE) console.log("this.chooseMove said : " + result);
        return result;
    }
    public decodeMove(encodedMove: number): GoMove {
        return GoMove.decode(encodedMove);
    }
    public encodeMove(move: GoMove): number {
        return move.encode();
    }
    public updateBoard(): void {
        if (GoComponent.VERBOSE) {
            console.log('updateBoard');
        }
        const slice: GoPartSlice = this.rules.node.gamePartSlice;
        const move: GoMove = this.rules.node.move;
        const koCoord: Coord = slice.koCoord;
        const phase: Phase = slice.phase;

        this.board = slice.getCopiedBoard();
        this.scores = slice.getCapturedCopy();

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
    public pass(): boolean {
        return this.onClick(GoMove.pass.coord.x, GoMove.pass.coord.y);
    }
}