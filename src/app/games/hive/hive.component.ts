import { Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { HiveDummyMinimax } from './HiveDummyMinimax';
import { HiveFailure } from './HiveFailure';
import { HiveMove, HiveMoveCoordToCoord, HiveMoveSpider } from './HiveMove';
import { HivePiece, HivePieceBeetle, HivePieceGrasshopper, HivePieceQueenBee, HivePieceSoldierAnt, HivePieceSpider, HivePieceStack } from './HivePiece';
import { HiveRules } from './HiveRules';
import { HiveState } from './HiveState';
import { HiveTutorial } from './HiveTutorial';

interface Limits {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number
}

class ViewBox {
    public constructor(public readonly left: number,
                       public readonly up: number,
                       public readonly width: number,
                       public readonly height: number)
    {
    }

    public center(): Coord {
        return new Coord(this.left + this.width / 2, this.up + this.height / 2);
    }

    public bottom(): number {
        return this.up + this.height;
    }

    public right(): number {
        return this.left + this.width;
    }

    public expand(left: number, right: number, above: number, below: number): ViewBox {
        return new ViewBox(this.left - left, this.up - above, this.width + left + right, this.height + above + below);
    }

    public containingAtLeast(viewBox: ViewBox): ViewBox {
        const left: number = Math.max(this.left - viewBox.left, 0);
        const right: number = Math.max(viewBox.right() - this.right(), 0);
        const above: number = Math.max(this.up - viewBox.up, 0);
        const below: number = Math.max(viewBox.bottom() - this.bottom(), 0);
        return this.expand(left, right, above, below);
    }

    public toSVGString(): string {
        return `${this.left} ${this.up} ${this.width} ${this.height}`;
    }
}

interface PieceWithCoord {
    stack: HivePieceStack;
    coord: Coord;
}

@Component({
    selector: 'app-hive',
    templateUrl: './hive.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class HiveComponent
    extends HexagonalGameComponent<HiveRules, HiveMove, HiveState, HivePieceStack> {

    public readonly ORIGIN: Coord = new Coord(0, 0);

    public remainingPieces: HivePieceStack[] = [];
    public pieces: PieceWithCoord[] = [];
    public neighbors: Coord[] = [];
    public indicators: Coord[] = [];

    public inspectedStack: MGPOptional<HivePieceStack> = MGPOptional.empty();
    public selectedRemaining: MGPOptional<HivePiece> = MGPOptional.empty();
    private selectedStart: MGPOptional<Coord> = MGPOptional.empty();
    private selectedSpiderCoords: Coord[] = [];

    public readonly PIECE_HEIGHT: number;

    public selected: Coord[] = [];

    private boardViewBox: ViewBox;
    public viewBox: string;
    public inspectedStackTransform: string;

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = HiveRules.get();
        this.availableMinimaxes = [
            new HiveDummyMinimax(this.rules, 'HiveDummyMinimax'),
        ];
        this.encoder = HiveMove.encoder;
        this.tutorial = new HiveTutorial().tutorial;
        this.SPACE_SIZE = 30;
        this.PIECE_HEIGHT = this.SPACE_SIZE / 3;
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE * 1.5,
                                         new Coord(this.SPACE_SIZE * 2, 0),
                                         FlatHexaOrientation.INSTANCE);
        this.updateBoard();
    }

    public updateBoard(): void {
        // TODO: player should be able to pass when needed
        this.pieces = [];
        for (const coord of this.getState().occupiedSpaces()) {
            const stack: HivePieceStack = this.getState().getAt(coord);
            this.pieces.push({ coord, stack });
        }
        this.pieces.sort((piece1: PieceWithCoord, piece2: PieceWithCoord): number => {
            if (piece1.coord.y === piece2.coord.y) return piece1.coord.x - piece2.coord.x;
            else return piece1.coord.y - piece2.coord.y;
        });
        this.neighbors = this.getAllNeighbors();
        this.computeViewBox();
        this.remainingPieces = this.getState().remainingPieces.toListOfStacks();
    }

    private computeViewBox(): void {
        this.boardViewBox = this.getViewBox();
        const minimalViewBox: ViewBox = new ViewBox(
            this.getRemainingPieceTransformAsCoord(new HivePieceQueenBee(Player.ZERO)).x,
            0,
            this.SPACE_SIZE * 4 * 5,
            0);
        const spaceForRemainingPieces: number = this.SPACE_SIZE*5;
        const boardAndRemainingViewBox: ViewBox = this.boardViewBox
            .containingAtLeast(minimalViewBox)
            .expand(0, 0, spaceForRemainingPieces, spaceForRemainingPieces);
        const inspectedStackPosition: Coord =
            new Coord(boardAndRemainingViewBox.right() + this.SPACE_SIZE,
                      boardAndRemainingViewBox.center().y);
        this.inspectedStackTransform = `translate(${inspectedStackPosition.x} ${inspectedStackPosition.y})`;

        const spaceForInspectedStack: number = this.SPACE_SIZE*5;
        this.viewBox = boardAndRemainingViewBox
            .expand(0, spaceForInspectedStack, 0, 0)
            .toSVGString();
    }

    private getAllNeighbors(): Coord[] {
        const neighbors: MGPSet<Coord> = new MGPSet();
        for (const piece of this.pieces) {
            neighbors.union(new MGPSet(this.getState().emptyNeighbors(piece.coord)));
        }
        if (neighbors.isEmpty()) {
            // We need at least one clickable coord to be playable at first turn
            neighbors.add(new Coord(0, 0));
        }
        return neighbors.toList();
    }

    public cancelMoveAttempt(): void {
        this.selectedRemaining = MGPOptional.empty();
        this.selectedStart = MGPOptional.empty();
        this.selectedSpiderCoords = [];
        this.selected = [];
        this.indicators = [];
        this.inspectedStack = MGPOptional.empty();
    }

    public getRemainingPieceTransformAsCoord(piece: HivePiece): Coord {
        const shift: number = this.getRemainingPieceShift(piece);
        const x: number = this.boardViewBox.center().x + shift * this.SPACE_SIZE * 4;
        let y: number;
        if (piece.owner === this.role) {
            // Current player is below
            y = this.boardViewBox.bottom() + (this.SPACE_SIZE * 3);
        } else {
            y = this.boardViewBox.up - (this.SPACE_SIZE * 2);
        }
        return new Coord(x, y);
    }

    public getRemainingPieceTransform(piece: HivePiece): string {
        const transform: Coord = this.getRemainingPieceTransformAsCoord(piece);
        return `translate(${transform.x} ${transform.y})`;
    }

    public getRemainingPieceHighlightTransform(piece: HivePiece): string {
        const transform: Coord = this.getRemainingPieceTransformAsCoord(piece);
        const size: number = this.getState().remainingPieces.getRemaining(piece);
        return `translate(${transform.x} ${transform.y - (this.PIECE_HEIGHT * size)})`;
    }

    private getRemainingPieceShift(piece: HivePiece): number {
        if (piece instanceof HivePieceQueenBee) return -2.5;
        if (piece instanceof HivePieceBeetle) return -1.5;
        if (piece instanceof HivePieceGrasshopper) return -0.5;
        if (piece instanceof HivePieceSpider) return 0.5;
        Utils.assert(piece instanceof HivePieceSoldierAnt, 'piece must be a soldier ant');
        return 1.5;
    }

    public async selectRemaining(piece: HivePiece): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay(`#remainingPiece_${piece.toString() }`);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (piece.owner !== this.getCurrentPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (piece instanceof HivePieceQueenBee === false &&
            HiveRules.get().mustPlaceQueenBee(this.getState())) {
            return this.cancelMove(HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN());
        }

        this.cancelMoveAttempt();
        this.selectedRemaining = MGPOptional.of(piece);
        this.indicators = HiveRules.get().getPossibleDropLocations(this.getState()).toList();
        return MGPValidation.SUCCESS;
    }

    public async selectSpace(coord: Coord, selection: 'piece' | 'space'): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay(`#${selection}_${coord.x}_${coord.y}`);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        const state: HiveState = this.getState();
        const stack: HivePieceStack = state.getAt(coord);
        if (this.selectedRemaining.isPresent()) {
            const move: HiveMove = HiveMove.drop(this.selectedRemaining.get(), coord.x, coord.y);
            return this.chooseMove(move, state);
        }
        if (this.selectedStart.isPresent()) {
            const topPiece: HivePiece = state.getAt(this.selectedStart.get()).topPiece();
            if (topPiece instanceof HivePieceSpider) {
                return this.selectNextSpiderSpace(coord, topPiece);
            } else {
                const move: HiveMove = HiveMove.move(this.selectedStart.get(), coord);
                return this.chooseMove(move, state);
            }
        } else {
            if (stack.size() === 0) {
                return this.cancelMove();
            }
            const piece: HivePiece = stack.topPiece();
            if (piece.owner !== state.getCurrentPlayer()) {
                if (stack.size() === 1) {
                    return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
                } else {
                    // We will only inspect the opponent stack, not do a move
                    this.selected.push(coord);
                    this.inspectedStack = MGPOptional.of(stack);
                    return MGPValidation.SUCCESS;
                }
            }
            if (piece instanceof HivePieceQueenBee === false &&
                HiveRules.get().mustPlaceQueenBee(state)) {
                return this.cancelMove(HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN());
            }
            this.selectedStart = MGPOptional.of(coord);
            this.selected.push(coord);
            if (piece instanceof HivePieceSpider) {
                this.selectedSpiderCoords.push(this.selectedStart.get());
            }
            if (stack.size() > 1) {
                this.inspectedStack = MGPOptional.of(stack);
            }
            this.indicators = this.getNextPossibleCoords(coord);
        }
        return MGPValidation.SUCCESS;
    }

    public getHighlightTransform(coord: Coord): string {
        // TODO: should draw indicators and pieces per layer (z = 0 first, then z = 1) for proper view
        const height: number = this.getState().getAt(coord).size() * this.PIECE_HEIGHT;
        return `translate(0 -${height})`;
    }

    private getNextPossibleCoords(coord: Coord): Coord[] {
        const state: HiveState = this.getState();
        const topPiece: HivePiece = state.getAt(coord).topPiece();
        const moves: MGPSet<HiveMoveCoordToCoord> = HiveRules.get().getPossibleMovesFrom(state, coord);
        if (topPiece instanceof HivePieceSpider) {
            const spiderMoves: MGPSet<HiveMoveSpider> = moves as MGPSet<HiveMoveSpider>;
            return spiderMoves
                .filter((move: HiveMoveSpider) => ArrayUtils.isPrefix(this.selectedSpiderCoords, move.coords))
                .map((move: HiveMoveSpider) => move.coords[this.selectedSpiderCoords.length])
                .toList();
        } else {
            return moves.map((move: HiveMoveCoordToCoord) => move.end).toList();
        }
    }

    private async selectNextSpiderSpace(coord: Coord, spider: HivePieceSpider): Promise<MGPValidation> {
        this.selectedSpiderCoords.push(coord);
        this.selected.push(coord);
        if (this.selectedSpiderCoords.length === 4) {
            const move: HiveMove = HiveMove.spiderMove(this.selectedSpiderCoords as [Coord, Coord, Coord, Coord]);
            return this.chooseMove(move, this.getState());
        }
        const validity: MGPFallible<void> = spider.prefixValidity(this.selectedSpiderCoords, this.getState());
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.indicators = this.getNextPossibleCoords(this.selectedStart.get());
        return MGPValidation.SUCCESS;
    }

    // TODO: the rest here is (almost) stolen from SixComponent, try to generalize this
    private getViewBox(): ViewBox {
        const hexaCoords: Coord[] = this.mapAbstractCoordToCornerCoords();
        const limits: Limits = this.getLimits(hexaCoords);
        const left: number = limits.minX - (this.STROKE_WIDTH / 2);
        const up: number = limits.minY - (this.STROKE_WIDTH / 2);
        const width: number = this.STROKE_WIDTH + limits.maxX - limits.minX;
        const height: number = this.STROKE_WIDTH + limits.maxY - limits.minY;
        return new ViewBox(left, up, width, height);
    }
    private mapAbstractCoordToCornerCoords(): Coord[] {
        const abstractCoords: Coord[] =
            this.pieces.map((piece: PieceWithCoord) => piece.coord)
                .concat(this.neighbors);
        abstractCoords.push(new Coord(0, 0)); // Need at least one coord for Hive
        const pieceCornersGrouped: Coord[][] =
            abstractCoords.map((coord: Coord) => this.hexaLayout.getHexaCoordListAt(coord));
        let cornerCoords: Coord[] = [];
        for (const pieceCornerGroup of pieceCornersGrouped) {
            cornerCoords = cornerCoords.concat(pieceCornerGroup);
        }
        return cornerCoords;
    }
    private getLimits(coords: Coord[]): Limits {
        let maxX: number = Number.MIN_SAFE_INTEGER;
        let maxY: number = Number.MIN_SAFE_INTEGER;
        let minX: number = Number.MAX_SAFE_INTEGER;
        let minY: number = Number.MAX_SAFE_INTEGER;
        for (const coord of coords) {
            if (coord.x < minX) {
                minX = coord.x;
            }
            if (coord.y < minY) {
                minY = coord.y;
            }
            maxX = Math.max(maxX, coord.x);
            maxY = Math.max(maxY, coord.y);
        }
        return { minX, minY, maxX, maxY };
    }
}
