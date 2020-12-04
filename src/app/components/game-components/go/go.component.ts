import { Component } from '@angular/core';
import { AbstractGameComponent } from '../AbstractGameComponent';
import { GoMove } from 'src/app/games/go/gomove/GoMove';
import { GoRules } from 'src/app/games/go/gorules/GoRules';
import { GoPartSlice, Phase, GoPiece } from 'src/app/games/go/GoPartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { GoLegalityStatus } from 'src/app/games/go/GoLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { GroupDatas } from 'src/app/games/go/groupdatas/GroupDatas';
import { MatSnackBar } from '@angular/material/snack-bar';
import { display } from 'src/app/collectionlib/utils';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';

@Component({
    selector: 'app-go',
    templateUrl: './go.component.html'
})
export class GoComponent extends AbstractGameComponent<GoMove, GoPartSlice, GoLegalityStatus> {

    public static VERBOSE: boolean = false;

    public scores: number[] = [0, 0];

    public rules = new GoRules(GoPartSlice);

    public boardInfo: GroupDatas;

    public ko: Coord = new Coord(-1, -1);

    public last: Coord = new Coord(-1, -1);

    public canPass: boolean;

    constructor(public snackBar: MatSnackBar) {
        super(snackBar);
        this.canPass = true;
        this.showScore = true;
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        this.last = new Coord(-1, -1); // now the user stop try to do a move
        // we stop showing him the last move
        const resultlessMove: GoMove = new GoMove(x, y);
        const result: MGPValidation = await this.chooseMove(resultlessMove, this.rules.node.gamePartSlice, this.scores[0], this.scores[1]);
        display(GoComponent.VERBOSE, "GoComponent.onClick: AbstractGameComponent.chooseMove said : " + result);
        return result;
    }
    public decodeMove(encodedMove: number): GoMove {
        return GoMove.decode(encodedMove);
    }
    public encodeMove(move: GoMove): number {
        return move.encode();
    }
    public updateBoard(): void {
        display(GoComponent.VERBOSE, 'updateBoard');

        const slice: GoPartSlice = this.rules.node.gamePartSlice;
        const move: GoMove = this.rules.node.move;
        const koCoord: Coord = slice.koCoord;
        const phase: Phase = slice.phase;

        this.board = slice.getCopiedBoard();
        // this.boardInfo = GoRules.getGroupDatas()
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
    public async pass(): Promise<MGPValidation> {
        const phase: Phase = this.rules.node.gamePartSlice.phase;
        if (phase === Phase.PLAYING || phase === Phase.PASSED)
            return this.onClick(GoMove.PASS.coord.x, GoMove.PASS.coord.y);
        if (phase === Phase.COUNTING || phase === Phase.ACCEPT)
            return this.onClick(GoMove.ACCEPT.coord.x, GoMove.ACCEPT.coord.y);
        else
            return MGPValidation.failure("cannot pass");
    }
    public getCaseColor(x: number, y: number): string {
        const piece: number = this.rules.node.gamePartSlice.getBoardByXY(x, y);
        if (GoPiece.pieceBelongTo(piece, Player.ZERO)) {
            return "black";
        }
        if (GoPiece.pieceBelongTo(piece, Player.ONE)) {
            return "white";
        }
        throw new Error("Empty case has no color");
    }
    public caseIsFull(x: number, y: number): boolean {
        const piece: GoPiece = this.rules.node.gamePartSlice.getBoardByXYGoPiece(x, y);
        return piece !== GoPiece.EMPTY && !this.isTerritory(x, y);
    }
    public isLastCase(x: number, y: number): boolean {
        return x === this.last.x && y === this.last.y;
    }
    public isKo(x: number, y: number): boolean {
        return x === this.ko.x && y === this.ko.y;
    }
    public isDead(x: number, y: number): boolean {
        const piece: GoPiece = this.rules.node.gamePartSlice.getBoardByXYGoPiece(x, y);
        return piece === GoPiece.DEAD_BLACK || piece === GoPiece.DEAD_WHITE;
    }
    public isTerritory(x: number, y: number): boolean {
        const piece: GoPiece = this.rules.node.gamePartSlice.getBoardByXYGoPiece(x, y);
        return piece === GoPiece.WHITE_TERRITORY || piece === GoPiece.BLACK_TERRITORY;
    }
    public territorialize(slice: GoPartSlice): GoPartSlice {
        return GoRules.markTerritoryAndCount(slice);
    }
}
