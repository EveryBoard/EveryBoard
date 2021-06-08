import { Component } from '@angular/core';
import { TriangularGameComponent }
    from 'src/app/components/game-components/abstract-game-component/TriangularGameComponent';
import { CoerceoMove } from 'src/app/games/coerceo/CoerceoMove';
import { CoerceoPartSlice, CoerceoPiece } from 'src/app/games/coerceo/CoerceoPartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoNode, CoerceoRules } from 'src/app/games/coerceo/CoerceoRules';
import { CoerceoMinimax } from 'src/app/games/coerceo/CoerceoMinimax';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoerceoFailure } from 'src/app/games/coerceo/CoerceoFailure';
import { Player } from 'src/app/jscaip/Player';
import { MoveEncoder } from 'src/app/jscaip/Encoder';

@Component({
    selector: 'app-coerceo',
    templateUrl: './coerceo.component.html',
    styleUrls: ['../../components/game-components/abstract-game-component/abstract-game-component.css'],
})
export class CoerceoComponent extends TriangularGameComponent<CoerceoMove,
                                                              CoerceoPartSlice,
                                                              LegalityStatus>
{

    private slice: CoerceoPartSlice;

    public CASE_SIZE: number = 100;

    public scores: { readonly 0: number; readonly 1: number; } = [0, 0];
    public tiles: { readonly 0: number; readonly 1: number; } = [0, 0];

    public EMPTY: number = CoerceoPiece.EMPTY.value;
    public NONE: number = CoerceoPiece.NONE.value;

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    public lastStart: MGPOptional<Coord> = MGPOptional.empty();
    public lastEnd: MGPOptional<Coord> = MGPOptional.empty();

    public highlights: Coord[] = [];

    constructor(snackBar: MatSnackBar) {
        super(snackBar);
        this.rules = new CoerceoRules(CoerceoPartSlice);
        this.availableMinimaxes = [
            new CoerceoMinimax(this.rules, 'CoerceoMinimax'),
        ];

        this.showScore = true;
        this.updateBoard();
    }
    public encoder: MoveEncoder<CoerceoMove> = CoerceoMove.encoder;
    public updateBoard(): void {
        this.chosenCoord = MGPOptional.empty();
        this.slice = this.rules.node.gamePartSlice;
        this.scores = this.slice.captures;
        this.tiles = this.slice.tiles;
        const move: CoerceoMove = this.rules.node.move;
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
    private async firstClick(coord: Coord): Promise<MGPValidation> {
        const clickedPiece: number = this.slice.getBoardAt(coord);
        if (clickedPiece === this.slice.getCurrentEnnemy().value) {
            const move: CoerceoMove = CoerceoMove.fromTilesExchange(coord);
            return this.chooseMove(move, this.slice, this.slice.captures[0], this.slice.captures[1]);
        } else if (clickedPiece === this.slice.getCurrentPlayer().value) {
            this.chosenCoord = MGPOptional.of(coord);
            this.showHighlight();
        } else {
            return this.cancelMove(CoerceoFailure.FIRST_CLICK_SHOULD_NOT_BE_NULL);
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
    public isPyramid(x: number, y: number, caseContent: number): boolean {
        return caseContent === CoerceoPiece.ZERO.value ||
               caseContent === CoerceoPiece.ONE.value ||
               this.wasEnnemy(x, y);
    }
    private wasEnnemy(x: number, y: number): boolean {
        const mother: CoerceoNode = this.rules.node.mother;
        return mother && mother.gamePartSlice.getBoardByXY(x, y) === mother.gamePartSlice.getCurrentEnnemy().value;
    }
    public getPyramidClass(caseContent: number): string {
        if (caseContent === CoerceoPiece.ZERO.value) {
            return this.getPlayerClass(Player.ZERO);
        } else if (caseContent === CoerceoPiece.ONE.value) {
            return this.getPlayerClass(Player.ONE);
        } else {
            return 'captured';
        }
    }
    public isEmptyCase(x: number, y: number, caseContent: number): boolean {
        return caseContent === CoerceoPiece.EMPTY.value ||
               this.wasRemoved(x, y, caseContent);
    }
    private wasRemoved(x: number, y: number, caseContent: number): boolean {
        const mother: CoerceoNode = this.rules.node.mother;
        if (caseContent === CoerceoPiece.NONE.value && mother) {
            const previousContent: number = mother.gamePartSlice.getBoardByXY(x, y);
            return previousContent === CoerceoPiece.EMPTY.value ||
                   previousContent === mother.gamePartSlice.getCurrentPlayer().value;
        } else {
            return false;
        }
    }
    public getEmptyClass(x: number, y: number, caseContent: number): string {
        if (caseContent === CoerceoPiece.EMPTY.value) {
            if ((x+y)%2 === 1) {
                return 'background';
            } else {
                return 'background2';
            }
        } else {
            return 'captured2';
        }
    }
    public getTilesCountCoordinate(x: number, y: number): string {
        const bx: number = x * 100; const by: number = y * 100;
        const coin0x: number = bx + 25; const coin0y: number = by;
        const coin1x: number = bx + 75; const coin1y: number = by;
        const coin2x: number = bx + 100; const coin2y: number = by + 50;
        const coin3x: number = bx + 75; const coin3y: number = by + 100;
        const coin4x: number = bx + 25; const coin4y: number = by + 100;
        const coin5x: number = bx + 0; const coin5y: number = by + 50;
        return '' + coin0x + ', ' + coin0y + ', ' +
                    coin1x + ', ' + coin1y + ', ' +
                    coin2x + ', ' + coin2y + ', ' +
                    coin3x + ', ' + coin3y + ', ' +
                    coin4x + ', ' + coin4y + ', ' +
                    coin5x + ', ' + coin5y + ', ' +
                    coin0x + ', ' + coin0y;
    }
    public getLineCoordinate(x: number, y: number): string {
        const points: Coord[] = this.getTriangleCornerCoords(x, y);
        if (x % 3 === 0) {
            return points[0].x + ',' + points[0].y + ',' + points[1].x + ',' + points[1].y;
        } else if (x % 3 === 1) {
            return points[0].x + ',' + points[0].y + ',' + points[2].x + ',' + points[2].y;
        } else {
            return points[1].x + ',' + points[1].y + ',' + points[2].x + ',' + points[2].y;
        }
    }
    public mustShowTilesOf(player: number): boolean {
        if (this.tiles[player] > 0) {
            return true;
        } else {
            return this.lastTurnWasTilesExchange(player);
        }
    }
    public lastTurnWasTilesExchange(player: number): boolean {
        if (this.rules.node.mother == null) {
            return false;
        }
        const previousTiles: number = this.rules.node.mother.gamePartSlice.tiles[player];
        return previousTiles > this.tiles[player];
    }
}
