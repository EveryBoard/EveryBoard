import { Component } from '@angular/core';
import { TriangularGameComponent }
    from 'src/app/components/game-components/game-component/TriangularGameComponent';
import { CoerceoMove } from 'src/app/games/coerceo/CoerceoMove';
import { CoerceoState } from 'src/app/games/coerceo/CoerceoState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoNode, CoerceoRules } from 'src/app/games/coerceo/CoerceoRules';
import { CoerceoMinimax } from 'src/app/games/coerceo/CoerceoMinimax';
import { CoerceoPiecesThreatTilesMinimax } from './CoerceoPiecesThreatTilesMinimax';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { CoerceoFailure } from 'src/app/games/coerceo/CoerceoFailure';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/message-displayer/MessageDisplayer';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { CoerceoTutorial } from './CoerceoTutorial';

@Component({
    selector: 'app-coerceo',
    templateUrl: './coerceo.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class CoerceoComponent extends TriangularGameComponent<CoerceoRules,
                                                              CoerceoMove,
                                                              CoerceoState,
                                                              FourStatePiece>
{
    private state: CoerceoState;

    public tiles: { readonly 0: number; readonly 1: number; } = [0, 0];

    public NONE: FourStatePiece = FourStatePiece.NONE;

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    public lastStart: MGPOptional<Coord> = MGPOptional.empty();
    public lastEnd: MGPOptional<Coord> = MGPOptional.empty();

    public highlights: Coord[] = [];

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.scores = MGPOptional.of([0, 0]);
        this.rules = new CoerceoRules(CoerceoState);
        this.availableMinimaxes = [
            new CoerceoMinimax(this.rules, 'Normal'),
            new CoerceoPiecesThreatTilesMinimax(this.rules, 'Piece > Threat > Tiles'),
        ];
        this.encoder = CoerceoMove.encoder;
        this.tutorial = new CoerceoTutorial().tutorial;
        this.SPACE_SIZE = 70;
        this.updateBoard();
    }
    public updateBoard(): void {
        this.chosenCoord = MGPOptional.empty();
        this.state = this.rules.node.gameState;
        this.scores = MGPOptional.of(this.state.captures);
        this.tiles = this.state.tiles;
        const move: MGPOptional<CoerceoMove> = this.rules.node.move;
        if (move.isPresent()) {
            this.lastStart = move.get().start;
            this.lastEnd = move.get().landingCoord;
        } else {
            this.lastStart = MGPOptional.empty();
            this.lastEnd = MGPOptional.empty();
        }
        this.board = this.rules.node.gameState.board;
    }
    private showHighlight() {
        this.highlights = this.state.getLegalLandings(this.chosenCoord.get());
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
        const clickedPiece: FourStatePiece = this.state.getPieceAt(coord);
        if (clickedPiece.is(this.state.getCurrentOpponent())) {
            const move: CoerceoMove = CoerceoMove.fromTilesExchange(coord);
            return this.chooseMove(move, this.state, this.state.captures);
        } else if (clickedPiece.is(this.state.getCurrentPlayer())) {
            this.chosenCoord = MGPOptional.of(coord);
            this.showHighlight();
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(CoerceoFailure.FIRST_CLICK_SHOULD_NOT_BE_NULL());
        }
    }
    private async secondClick(coord: Coord): Promise<MGPValidation> {
        if (coord.equals(this.chosenCoord.get())) {
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } else if (this.highlights.some((c: Coord) => c.equals(coord))) {
            const move: CoerceoMove = CoerceoMove.fromCoordToCoord(this.chosenCoord.get(), coord);
            return this.chooseMove(move, this.state, this.state.captures);
        } else {
            return this.cancelMove(CoerceoFailure.INVALID_DISTANCE());
        }
    }
    public isPyramid(x: number, y: number): boolean {
        const caseContent: FourStatePiece = this.board[y][x];
        return caseContent.isPlayer() || this.wasOpponent(x, y);
    }
    private wasOpponent(x: number, y: number): boolean {
        const mother: MGPOptional<CoerceoNode> = this.rules.node.mother;
        return mother.isPresent() &&
               mother.get().gameState.getPieceAtXY(x, y).is(mother.get().gameState.getCurrentOpponent());
    }
    public getPyramidClass(x: number, y: number): string {
        const caseContent: FourStatePiece = this.board[y][x];
        if (caseContent === FourStatePiece.ZERO) {
            return this.getPlayerClass(Player.ZERO);
        } else if (caseContent === FourStatePiece.ONE) {
            return this.getPlayerClass(Player.ONE);
        } else {
            return 'captured';
        }
    }
    public isEmptyCase(x: number, y: number): boolean {
        const caseContent: FourStatePiece = this.board[y][x];
        return caseContent === FourStatePiece.EMPTY ||
               this.wasRemoved(x, y);
    }
    private wasRemoved(x: number, y: number): boolean {
        const caseContent: FourStatePiece = this.board[y][x];
        const mother: MGPOptional<CoerceoNode> = this.rules.node.mother;
        if (caseContent === FourStatePiece.NONE && mother.isPresent()) {
            const previousContent: FourStatePiece = mother.get().gameState.getPieceAtXY(x, y);
            return previousContent === FourStatePiece.EMPTY ||
                   previousContent.is(mother.get().gameState.getCurrentPlayer());
        } else {
            return false;
        }
    }
    public getEmptyClass(x: number, y: number): string {
        const caseContent: FourStatePiece = this.board[y][x];
        if (caseContent === FourStatePiece.EMPTY) {
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
        if (this.rules.node.mother.isAbsent()) {
            return false;
        }
        const previousTiles: number = this.rules.node.mother.get().gameState.tiles[player];
        return previousTiles > this.tiles[player];
    }
}
