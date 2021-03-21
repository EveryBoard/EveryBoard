import { Component } from '@angular/core';
import { TriangularGameComponent } from '../TriangularGameComponent';
import { CoerceoMove } from 'src/app/games/coerceo/coerceo-move/CoerceoMove';
import { CoerceoPartSlice, CoerceoPiece } from 'src/app/games/coerceo/coerceo-part-slice/CoerceoPartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Move } from 'src/app/jscaip/Move';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { CoerceoFailure, CoerceoRules } from 'src/app/games/coerceo/coerceo-rules/CoerceoRules';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { assert } from 'src/app/utils/collection-lib/utils';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';

@Component({
    selector: 'app-coerceo',
    templateUrl: './coerceo.component.html',
    styleUrls: ['./coerceo.component.css'],
})
export class CoerceoComponent extends TriangularGameComponent<CoerceoMove,
                                                              CoerceoPartSlice,
                                                              LegalityStatus>
{
    public rules: CoerceoRules = new CoerceoRules(CoerceoPartSlice);

    private slice: CoerceoPartSlice;

    public scores: [number, number] = [0, 0];

    public EMPTY: number = CoerceoPiece.EMPTY.value;
    public NONE: number = CoerceoPiece.NONE.value;

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    public lastStart: MGPOptional<Coord> = MGPOptional.empty();
    public lastEnd: MGPOptional<Coord> = MGPOptional.empty();

    public highlights: Coord[] = [];

    constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.showScore = true;
        this.updateBoard();
    }
    public updateBoard(): void {
        this.chosenCoord = MGPOptional.empty();
        this.slice = this.rules.node.gamePartSlice;
        const move: CoerceoMove = this.rules.node.move;
        this.cancelMoveAttempt();
        if (move) {
            this.lastStart = move.start;
            this.lastEnd = move.landingCoord;
        } else {
            this.lastStart = MGPOptional.empty();
            this.lastEnd = MGPOptional.empty();
        }
        this.board = this.rules.node.gamePartSlice.board;
    }
    private showHighlight() {
        this.highlights = this.slice.getLegalLandings(this.chosenCoord.get());
    }
    public cancelMoveAttempt(): void {
        this.chosenCoord = MGPOptional.empty();
        this.highlights = [];
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const coord: Coord = new Coord(x, y);
        if (this.chosenCoord.isAbsent()) {
            return this.firstClick(coord);
        } else {
            return this.secondClick(coord);
        }
    }
    private firstClick(coord: Coord): Promise<MGPValidation> {
        const clickedPiece: number = this.slice.getBoardAt(coord);
        if (clickedPiece === this.slice.getCurrentEnnemy().value) {
            const move: CoerceoMove = CoerceoMove.fromTilesExchange(coord);
            return this.chooseMove(move, this.slice, this.slice.captures[0], this.slice.captures[1]);
        } else if (clickedPiece === this.slice.getCurrentPlayer().value) {
            this.chosenCoord = MGPOptional.of(coord);
            this.showHighlight();
        }
    }
    private async secondClick(coord: Coord): Promise<MGPValidation> {
        if (coord.equals(this.chosenCoord.get())) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } if (this.highlights.some((c: Coord) => c.equals(coord))) {
            const move: CoerceoMove = CoerceoMove.fromCoordToCoord(this.chosenCoord.get(), coord);
            return this.chooseMove(move, this.slice, this.slice.captures[0], this.slice.captures[1]);
        } else {
            return this.cancelMove(CoerceoFailure.INVALID_DISTANCE);
        }
    }
    public decodeMove(encodedMove: number): Move {
        return CoerceoMove.decode(encodedMove);
    }
    public encodeMove(move: Move): number {
        return move.encode();
    }
    public isRemoved(x: number, y: number): boolean {
        assert(this.board[y][x] === CoerceoPiece.NONE.value, 'Should only be called on removed tiles');
        if (this.rules.node.mother) {
            const previousContent: number = this.rules.node.mother.gamePartSlice.getBoardByXY(x, y);
            const wasEmpty: boolean =
                previousContent === CoerceoPiece.EMPTY.value;
            const wasEnnemy: boolean =
                previousContent === this.slice.getCurrentPlayer().value;
            return wasEmpty || wasEnnemy;
        } else {
            return false;
        }
    }
    public getCaptureFill(x: number, y: number): string {
        const previousContent: number = this.rules.node.mother.gamePartSlice.getBoardByXY(x, y);
        const wasEmpty: boolean = previousContent === CoerceoPiece.EMPTY.value;
        if (wasEmpty) {
            return 'lightred';
        } else {
            return 'red';
        }
    }
}
