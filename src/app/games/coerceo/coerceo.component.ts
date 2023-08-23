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
import { CoerceoHeuristic } from './CoerceoHeuristic';
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

    public chosenCoord: MGPOptional<Coord> = MGPOptional.empty();
    public lastStart: MGPOptional<Coord> = MGPOptional.empty();
    public lastEnd: MGPOptional<Coord> = MGPOptional.empty();

    public possibleLandings: Coord[] = [];

    public constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.scores = MGPOptional.of([0, 0]);
        this.rules = CoerceoRules.get();
        this.node = this.rules.getInitialNode();
        this.availableAIs = [
            new Minimax('Pieces > Threats > Tiles',
                        this.rules,
                        new CoerceoPiecesThreatsTilesHeuristic(),
                        new CoerceoOrderedMoveGenerator()),
            new Minimax('Minimax', CoerceoRules.get(), new CoerceoHeuristic(), new CoerceoMoveGenerator()),
            new MCTS('MCTS', new CoerceoMoveGenerator(), this.rules),
        ];
        this.encoder = CoerceoMove.encoder;
        this.tutorial = new CoerceoTutorial().tutorial;
        this.SPACE_SIZE = 70;
        this.updateBoard();
    }
    public updateBoard(): void {
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
    public override showLastMove(move: CoerceoMove): void {
        if (move instanceof CoerceoRegularMove) {
            this.lastStart = MGPOptional.of(move.getStart());
            this.lastEnd = MGPOptional.of(move.getEnd());
        } else {
            this.lastStart = MGPOptional.empty();
            this.lastEnd = MGPOptional.empty();
        }
    }
    public async onClick(x: number, y: number): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay('#click_' + x + '_' + y);
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
        return parent.isPresent() &&
               parent.get().gameState.getPieceAtXY(x, y).is(parent.get().gameState.getCurrentOpponent());
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
    public isEmptySpace(x: number, y: number): boolean {
        const spaceContent: FourStatePiece = this.board[y][x];
        return spaceContent === FourStatePiece.EMPTY ||
               this.wasRemoved(x, y);
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
    public getEmptyClass(x: number, y: number): string {
        const spaceContent: FourStatePiece = this.board[y][x];
        if (spaceContent === FourStatePiece.EMPTY) {
            if ((x+y)%2 === 1) {
                return 'background';
            } else {
                return 'background2';
            }
        } else {
            return 'captured-alternate-fill';
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
        if (this.node.parent.isAbsent()) {
            return false;
        }
        const previousTiles: number = this.getPreviousState().tiles[player];
        return previousTiles > this.tiles[player];
    }
}
