import {Component} from '@angular/core';
import {AbstractGameComponent} from '../AbstractGameComponent';
import {GoMove} from 'src/app/games/go/gomove/GoMove';
import {GoRules} from 'src/app/games/go/gorules/GoRules';
import {GoPartSlice, Phase, GoPiece, Pawn} from 'src/app/games/go/GoPartSlice';
import {Coord} from 'src/app/jscaip/Coord';
import { GoLegalityStatus } from 'src/app/games/go/GoLegalityStatus';
import { Player } from 'src/app/jscaip/Player';

@Component({
    selector: 'app-go',
    templateUrl: './go.component.html'
})
export class GoComponent extends AbstractGameComponent<GoMove, GoPartSlice, GoLegalityStatus> {

    public static VERBOSE: boolean = false;

    public scores: number[] = [0, 0];

    public rules = new GoRules();

    public ko: Coord = new Coord(-1, -1);

    public last: Coord = new Coord(-1, -1);

    public canPass: boolean;

    constructor() {
        super();
        this.canPass = true;
        this.showScore = true;
    }
    public async onClick(x: number, y: number): Promise<boolean> {
        if (GoComponent.VERBOSE) console.log("salut " + x + "-" + y);
        this.last = new Coord(-1, -1); // now the user stop try to do a move
        // we stop showing him the last move
        const resultlessMove: GoMove = new GoMove(x, y);
        const result: boolean = await this.chooseMove(resultlessMove, this.rules.node.gamePartSlice, this.scores[0], this.scores[1]);
        if (GoComponent.VERBOSE) console.log("GoComponent.onClick: AbstractGameComponent.chooseMove said : " + result);
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
            this.last = move.coord;
        }
        if (koCoord != null) {
            this.ko = koCoord;
        } else {
            this.ko = new Coord(-1, -1);
        }
        this.canPass = phase !== Phase.FINISHED;
    }
    public async pass(): Promise<boolean> {
        const phase: Phase = this.rules.node.gamePartSlice.phase;
        if (phase === Phase.PLAYING || phase === Phase.PASSED)
            return this.onClick(GoMove.PASS.coord.x, GoMove.PASS.coord.y);
        if (phase === Phase.COUNTING || phase === Phase.ACCEPT)
            return this.onClick(GoMove.ACCEPT.coord.x, GoMove.ACCEPT.coord.y);
        else
            return false;
    }
    public getCaseColor(x: number, y: number): string {
        const piece: Pawn = this.rules.node.gamePartSlice.getBoardByXY(x, y);
        if (GoPiece.pieceBelongTo(piece, Player.ZERO)) {
            return "black";
        }
        if (GoPiece.pieceBelongTo(piece, Player.ONE)) {
            return "white";
        }
        throw new Error("Empty case has no color");
    }
    public caseIsFull(x: number, y: number): boolean {
        const piece: Pawn = this.rules.node.gamePartSlice.getBoardByXY(x, y);
        return piece !== Pawn.EMPTY;
    }
    public isLastCase(x: number, y: number): boolean {
        return x === this.last.x && y === this.last.y;
    }
    public isKo(x: number, y: number): boolean {
        return x === this.ko.x && y === this.ko.y;
    }
    public isDead(x: number, y: number): boolean {
        const piece: Pawn = this.rules.node.gamePartSlice.getBoardByXY(x, y);
        return piece === Pawn.DEAD_BLACK || piece === Pawn.DEAD_WHITE;
    }
}