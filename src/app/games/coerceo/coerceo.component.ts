import { Component } from '@angular/core';
import { TriangularGameComponent }
    from 'src/app/components/game-components/game-component/TriangularGameComponent';
import { CoerceoMove, CoerceoRegularMove, CoerceoTileExchangeMove } from 'src/app/games/coerceo/CoerceoMove';
import { CoerceoState } from 'src/app/games/coerceo/CoerceoState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { CoerceoNode, CoerceoRules } from 'src/app/games/coerceo/CoerceoRules';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { CoerceoFailure } from 'src/app/games/coerceo/CoerceoFailure';
import { Player } from 'src/app/jscaip/Player';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { CoerceoTutorial } from './CoerceoTutorial';
import { MCTS } from 'src/app/jscaip/MCTS';
import { CoerceoCapturesAndFreedomHeuristic } from './CoerceoCapturesAndFreedomHeuristic';
import { Minimax } from 'src/app/jscaip/Minimax';
import { CoerceoMoveGenerator } from './CoerceoMoveGenerator';
import { CoerceoPiecesThreatsTilesHeuristic } from './CoerceoPiecesThreatsTilesHeuristic';
import { CoerceoOrderedMoveGenerator } from './CoerceoOrderedMoveGenerator';

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

    public NONE: FourStatePiece = FourStatePiece.UNREACHABLE;
    public INDICATOR_SIZE: number = 15;

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    public lastStart: MGPOptional<Coord> = MGPOptional.empty();
    public lastEnd: MGPOptional<Coord> = MGPOptional.empty();

    public possibleLandings: Coord[] = [];

    public left: number = - 2 * this.STROKE_WIDTH;
    public up: number = (- this.SPACE_SIZE / 2) - (2 * this.STROKE_WIDTH);
    public width: number = this.SPACE_SIZE * 8;
    public height: number = 10 * (this.SPACE_SIZE + this.STROKE_WIDTH);

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.scores = MGPOptional.of([0, 0]);
        this.rules = CoerceoRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new Minimax($localize`Pieces > Threats > Tiles`,
                        this.rules,
                        new CoerceoPiecesThreatsTilesHeuristic(),
                        new CoerceoOrderedMoveGenerator()),
            new Minimax($localize`Captures > Freedom`, this.rules, new CoerceoCapturesAndFreedomHeuristic(), new CoerceoMoveGenerator()),
            new MCTS('MCTS', new CoerceoMoveGenerator(), this.rules),
        ];
        this.encoder = CoerceoMove.encoder;
        this.tutorial = new CoerceoTutorial().tutorial;
        this.SPACE_SIZE = 70;
        // this.updateBoard();
    }
    public async updateBoard(_triggerAnimation: boolean): Promise<void> {
        this.chosenCoord = MGPOptional.empty();
        this.state = this.getState();
        this.scores = MGPOptional.of(this.state.captures);
        this.tiles = this.state.tiles;
        this.board = this.getState().board;
    }
    private showHighlight(): void {
        this.possibleLandings = this.state.getLegalLandings(this.chosenCoord.get());
    }
    public override cancelMoveAttempt(): void {
        this.chosenCoord = MGPOptional.empty();
        this.possibleLandings = [];
    }
    public override async showLastMove(move: CoerceoMove): Promise<void> {
        if (move instanceof CoerceoRegularMove) {
            this.lastStart = MGPOptional.of(move.getStart());
            this.lastEnd = MGPOptional.of(move.getEnd());
        } else {
            this.lastStart = MGPOptional.empty();
            this.lastEnd = MGPOptional.empty();
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = await this.canUserPlay('#click_' + x + '_' + y);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const coord: Coord = new Coord(x, y);
        const currentPlayer: Player = this.state.getCurrentPlayer();
        if (this.chosenCoord.equalsValue(coord)) {
            // Deselects the piece
            this.cancelMoveAttempt();
            return MGPValidation.SUCCESS;
        } else if (this.chosenCoord.isAbsent() ||
                   this.state.getPieceAt(coord).is(currentPlayer))
        {
            return this.firstClick(coord);
        } else {
            return this.secondClick(coord);
        }
    }
    private async firstClick(coord: Coord): Promise<MGPValidation> {
        const clickedPiece: FourStatePiece = this.state.getPieceAt(coord);
        if (clickedPiece.is(this.state.getCurrentOpponent())) {
            const move: CoerceoMove = CoerceoTileExchangeMove.of(coord);
            return this.chooseMove(move);
        } else if (clickedPiece.is(this.state.getCurrentPlayer())) {
            this.chosenCoord = MGPOptional.of(coord);
            this.showHighlight();
            return MGPValidation.SUCCESS;
        } else {
            return this.cancelMove(CoerceoFailure.FIRST_CLICK_SHOULD_NOT_BE_NULL());
        }
    }
    private async secondClick(coord: Coord): Promise<MGPValidation> {
        if (this.possibleLandings.some((c: Coord) => c.equals(coord))) {
            const move: CoerceoMove = CoerceoRegularMove.of(this.chosenCoord.get(), coord);
            return this.chooseMove(move);
        } else {
            return this.cancelMove(CoerceoFailure.INVALID_DISTANCE());
        }
    }
    public isPyramid(x: number, y: number): boolean {
        const spaceContent: FourStatePiece = this.board[y][x];
        return spaceContent.isPlayer() || this.wasOpponent(x, y);
    }
    private wasOpponent(x: number, y: number): boolean {
        const parent: MGPOptional<CoerceoNode> = this.node.parent;
        if (parent.isPresent()) {
            const opponent: Player = parent.get().gameState.getCurrentOpponent();
            return parent.get().gameState.getPieceAtXY(x, y).is(opponent);
        } else {
            return false;
        }
    }
    public getPyramidClass(x: number, y: number): string {
        const spaceContent: FourStatePiece = this.board[y][x];
        if (spaceContent === FourStatePiece.ZERO) {
            return this.getPlayerClass(Player.ZERO);
        } else if (spaceContent === FourStatePiece.ONE) {
            return this.getPlayerClass(Player.ONE);
        } else {
            return 'captured-fill';
        }
    }
    public mustDraw(x: number, y: number): boolean {
        const spaceContent: FourStatePiece = this.board[y][x];
        if (spaceContent === FourStatePiece.UNREACHABLE) {
            // If it was just removed, we want to draw it
            return this.wasRemoved(x, y);
        } else {
            // If piece is reachable on the board, we want to draw it
            return true;
        }
    }
    private wasRemoved(x: number, y: number): boolean {
        const spaceContent: FourStatePiece = this.board[y][x];
        const parent: MGPOptional<CoerceoNode> = this.node.parent;
        if (spaceContent === FourStatePiece.UNREACHABLE && parent.isPresent()) {
            const previousContent: FourStatePiece = parent.get().gameState.getPieceAtXY(x, y);
            return previousContent === FourStatePiece.EMPTY ||
                   previousContent.is(parent.get().gameState.getCurrentPlayer());
        } else {
            return false;
        }
    }
    public getSpaceClass(x: number, y: number): string {
        if (this.wasRemoved(x, y)) {
            return 'captured-alternate-fill';
        } else {
            if ((x + y) % 2 === 1) {
                return 'background';
            } else {
                return 'background2';
            }
        }
    }
    public getTilesCountCoordinate(): string {
        const bx: number = -40; const by: number = -40;
        const corner0x: number = bx + 25; const corner0y: number = by;
        const corner1x: number = bx + 75; const corner1y: number = by;
        const corner2x: number = bx + 100; const corner2y: number = by + 50;
        const corner3x: number = bx + 75; const corner3y: number = by + 100;
        const corner4x: number = bx + 25; const corner4y: number = by + 100;
        const corner5x: number = bx + 0; const corner5y: number = by + 50;
        return '' + corner0x + ', ' + corner0y + ', ' +
                    corner1x + ', ' + corner1y + ', ' +
                    corner2x + ', ' + corner2y + ', ' +
                    corner3x + ', ' + corner3y + ', ' +
                    corner4x + ', ' + corner4y + ', ' +
                    corner5x + ', ' + corner5y + ', ' +
                    corner0x + ', ' + corner0y;
    }
    public mustShowTilesOf(player: Player): boolean {
        if (this.tiles[player.value] > 0) {
            return true;
        } else {
            return this.lastTurnWasTilesExchange(player);
        }
    }
    public lastTurnWasTilesExchange(player: Player): boolean {
        if (this.node.parent.isAbsent()) {
            return false;
        }
        const previousTiles: number = this.getPreviousState().tiles[player.value];
        return previousTiles > this.tiles[player.value];
    }
    public getIndicatorY(coord: Coord): number {
        const y: number = this.INDICATOR_SIZE / 2;
        if ((coord.x + coord.y) % 2 === 0) {
            return y;
        } else {
            return y - 30;
        }
    }
    public getTriangleInHexTranslate(x: number, y: number): string {
        const translate: Coord = this.getTriangleTranslateCoord(x, y);
        const translateX: number = translate.x + 2 * Math.floor(x / 3) * this.STROKE_WIDTH;
        let translateY: number = translate.y;
        if (Math.floor(x / 3) % 2 === 0) {
            translateY += 2 * Math.floor(y / 2) * this.STROKE_WIDTH;
        } else {
            translateY += 2 * Math.abs(Math.floor((y - 1) / 2)) * this.STROKE_WIDTH;
            translateY += this.STROKE_WIDTH;
        }
        return 'translate(' + translateX + ', ' + translateY + ')';
    }
    public getTilesCountTranslate(player: Player): string {
        let x: number;
        let y: number;
        if (player === Player.ZERO) {
            x = -0.05;
            y = -0.10;
        } else {
            x = 7.5;
            y = 9.45;
        }
        x = this.SPACE_SIZE * x;
        y = this.SPACE_SIZE * y;
        return 'translate(' + x + ', ' + y + ')';
    }
}
