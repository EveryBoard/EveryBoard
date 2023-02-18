import { Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { ViewBox } from 'src/app/components/game-components/GameComponentUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { HiveFailure } from './HiveFailure';
import { HiveMinimax } from './HiveMinimax';
import { HiveMove, HiveMoveCoordToCoord, HiveMoveDrop, HiveMoveSpider } from './HiveMove';
import { HivePiece, HivePieceStack } from './HivePiece';
import { HivePieceBehaviorSpider } from './HivePieceBehavior';
import { HiveRules } from './HiveRules';
import { HiveState } from './HiveState';
import { HiveTutorial } from './HiveTutorial';

// What to display at a given (x, y, z)
interface SpaceLevelInfo {
    piece: HivePiece;
    strokeClasses: string[];
}

interface GroundInfo {
    spaceClasses: string[];
    strokeClasses: string[];
}

@Component({
    selector: 'app-hive',
    templateUrl: './hive.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class HiveComponent extends HexagonalGameComponent<HiveRules, HiveMove, HiveState, HivePieceStack> {

    public readonly ORIGIN: Coord = new Coord(0, 0);

    public remainingPieces: HivePieceStack[] = [];
    public pieces: SpaceLevelInfo[][][] = [];
    // The ground can't be represented by an array as it may have negative indices
    // which cannot be iterated over
    public ground: MGPMap<number, MGPMap<number, GroundInfo>> = new MGPMap();

    public inspectedStack: MGPOptional<HivePieceStack> = MGPOptional.empty();
    public inspectedStackCoord: MGPOptional<Coord> = MGPOptional.empty();
    public selectedRemaining: MGPOptional<HivePiece> = MGPOptional.empty();
    private selectedStart: MGPOptional<Coord> = MGPOptional.empty();
    private selectedSpiderCoords: Coord[] = [];

    public readonly PIECE_HEIGHT: number;

    private boardViewBox: ViewBox;
    public viewBox: string;
    public inspectedStackTransform: string;

    constructor(messageDisplayer: MessageDisplayer) {
        super(messageDisplayer);
        this.rules = HiveRules.get();
        this.availableMinimaxes = [
            new HiveMinimax(this.rules, 'HiveMinimax'),
        ];
        this.encoder = HiveMove.encoder;
        this.tutorial = new HiveTutorial().tutorial;
        this.SPACE_SIZE = 30;
        this.PIECE_HEIGHT = this.SPACE_SIZE / 3;
        this.hexaLayout = new HexaLayout(this.SPACE_SIZE * 1.5,
                                         new Coord(this.SPACE_SIZE * 2, 0),
                                         FlatHexaOrientation.INSTANCE);
        this.canPass = false;
        this.updateBoard();
    }

    public updateBoard(): void {
        this.pieces = [];
        for (const coord of this.getState().occupiedSpaces()) {
            const stack: HivePieceStack = this.getState().getAt(coord);
            const x: number = coord.x;
            const y: number = coord.y;
            for (let z = 0; z < stack.size(); z++) {
                if (this.pieces[z] === undefined) this.pieces[z] = [];
                if (this.pieces[z][y] === undefined) this.pieces[z][y] = [];
                const piece: HivePiece = stack.pieces[stack.size() - 1 - z];
                this.pieces[z][y][x] = {
                    piece,
                    strokeClasses: [],
                };
            }
        }
        this.ground = this.getGround();
        this.inspectedStack = MGPOptional.empty(); // TODOTODO: shouldn't cancelMoveAttempt be called before updateBoard?
        this.inspectedStackCoord = MGPOptional.empty();
        this.computeViewBox();
        this.remainingPieces = this.getState().remainingPieces.toListOfStacks();
        this.canPass = HiveRules.get().shouldPass(this.getState());
        const gameStatus: GameStatus = HiveRules.get().getGameStatus(this.rules.node);
        switch (gameStatus) {
            case GameStatus.ONGOING:
                break;
            case GameStatus.DRAW:
                this.highlight(this.getState().queenBeeLocation(Player.ZERO).get(), 'victory-stroke');
                this.highlight(this.getState().queenBeeLocation(Player.ONE).get(), 'victory-stroke');
                break;
            default:
                // Zero or one won
                const winner: Player = gameStatus.winner as Player;
                const loser: Player = winner.getOpponent();
                this.highlight(this.getState().queenBeeLocation(loser).get(), 'victory-stroke');
        }
        if (this.rules.node.move.isPresent()) {
            this.showLastMove();
        }
    }

    private highlight(coord: Coord, stroke: string): void {
        const stackSize: number = this.getState().getAt(coord).size();
        this.pieces[stackSize-1][coord.y][coord.x].strokeClasses.push(stroke);
    }

    private highlightIfPresent(coord: Coord, stroke: string): void {
        const stackSize: number = this.getState().getAt(coord).size();
        if (this.pieces[stackSize-1] === undefined) return;
        if (this.pieces[stackSize-1][coord.y] === undefined) return;
        if (this.pieces[stackSize-1][coord.y][coord.x] === undefined) return;
        this.highlight(coord, stroke);
    }

    private removeHighlight(coord: Coord): void {
        const stackSize: number = this.getState().getAt(coord).size();
        if (this.pieces[stackSize-1] === undefined) return;
        if (this.pieces[stackSize-1][coord.y] === undefined) return;
        if (this.pieces[stackSize-1][coord.y][coord.x] === undefined) return;
        this.pieces[stackSize-1][coord.y][coord.x].strokeClasses = [];
        if (this.ground.get(coord.y).isAbsent() || this.ground.get(coord.y).get().get(coord.x).isAbsent()) {
            return;
        }
        this.ground.get(coord.y).get().get(coord.x).get().spaceClasses = [];
        this.ground.get(coord.y).get().get(coord.x).get().strokeClasses = [];
    }

    private highlightGroundIfShown(coord: Coord, fill: string): void {
        if (this.ground.get(coord.y).isAbsent() || this.ground.get(coord.y).get().get(coord.x).isAbsent()) {
            return;
        }
        this.ground.get(coord.y).get().get(coord.x).get().spaceClasses.push(fill);
    }

    private highlightGroundStrokeIfShown(coord: Coord, stroke: string): void {
        if (this.ground.get(coord.y).isAbsent() || this.ground.get(coord.y).get().get(coord.x).isAbsent()) {
            return;
        }
        this.ground.get(coord.y).get().get(coord.x).get().strokeClasses.push(stroke);
    }

    public async pass(): Promise<MGPValidation> {
        Utils.assert(this.canPass, 'DvonnComponent: pass() can only be called if canPass is true');
        return await this.chooseMove(HiveMove.PASS, this.getState());
    }

    private computeViewBox(): void {
        const coords: Coord[] = this.getPieceCoords().union(this.getAllNeighbors()).toList();
        coords.push(new Coord(0, 0)); // Need at least one coord for the first space
        this.boardViewBox = ViewBox.fromHexa(coords, this.hexaLayout, this.STROKE_WIDTH);
        const minimalViewBox: ViewBox = new ViewBox(
            this.getRemainingPieceTransformAsCoord(new HivePiece(Player.ZERO, 'QueenBee')).x,
            0,
            this.SPACE_SIZE * 4 * 5,
            0);

        const spaceForRemainingPieces: number = this.SPACE_SIZE*5;
        let spaceForZero: number = 0;
        if (this.getState().remainingPieces.getAny(Player.ZERO).isPresent()) {
            spaceForZero = spaceForRemainingPieces;
        }
        let spaceForOne: number = 0;
        if (this.getState().remainingPieces.getAny(Player.ONE).isPresent()) {
            spaceForOne = spaceForRemainingPieces;
        }

        const boardAndRemainingViewBox: ViewBox = this.boardViewBox
            .containingAtLeast(minimalViewBox)
            .expand(0, 0, spaceForZero, spaceForOne);
        if (this.inspectedStack.isPresent()) {
            const inspectedStackPosition: Coord =
                new Coord(boardAndRemainingViewBox.right() + this.SPACE_SIZE,
                          boardAndRemainingViewBox.center().y);
            const stackSize = this.inspectedStack.get().size();
            // y to get it centered vertically
            const y: number = inspectedStackPosition.y + (stackSize-1)*3*this.PIECE_HEIGHT;
            this.inspectedStackTransform = `translate(${inspectedStackPosition.x} ${y})`;

            const spaceForInspectedStack: number = this.SPACE_SIZE*5;
            this.viewBox = boardAndRemainingViewBox.expand(0, spaceForInspectedStack, 0, 0).toSVGString();
        } else {
            this.viewBox = boardAndRemainingViewBox.toSVGString();
        }
    }

    private getPieceCoords(): MGPSet<Coord> {
        return this.getState().pieces.getKeySet();
    }

    private getGround(): MGPMap<number, MGPMap<number, GroundInfo>> {
        const ground: MGPMap<number, MGPMap<number, GroundInfo>> = new MGPMap();
        for (const neighbor of this.getAllNeighbors()) {
            if (ground.get(neighbor.y).isAbsent()) ground.set(neighbor.y, new MGPMap());
            ground.get(neighbor.y).get().set(neighbor.x, { spaceClasses: [], strokeClasses: [] });
        }
        return ground;
    }

    private getAllNeighbors(): MGPSet<Coord> {
        const neighbors: MGPSet<Coord> = new MGPSet();
        for (const piece of this.getPieceCoords()) {
            neighbors.addAll(new MGPSet(this.getState().emptyNeighbors(piece)));
        }
        if (neighbors.isEmpty()) {
            // We need at least one clickable coord to be playable at first turn
            neighbors.add(new Coord(0, 0));
        }
        return neighbors;
    }

    public cancelMoveAttempt(): void {
        // TODO: remove ALL highlights (also next possible coords)
        this.selectedRemaining = MGPOptional.empty();
        if (this.selectedStart.isPresent()) {
            this.removeHighlight(this.selectedStart.get());
            this.selectedStart = MGPOptional.empty();
        }
        this.selectedSpiderCoords.forEach((c: Coord) => this.removeHighlight(c));
        this.selectedSpiderCoords = [];
        if (this.inspectedStack.isPresent()) {
            this.removeHighlight(this.inspectedStackCoord.get());
            this.inspectedStack = MGPOptional.empty();
        }
        if (this.rules.node.move.isPresent()) {
            this.showLastMove();
        }
        this.computeViewBox();
    }

    private showLastMove(): void {
        for (const coord of this.getLastMoveCoords()) {
            this.highlightIfPresent(coord, 'last-move-stroke');
            this.highlightGroundIfShown(coord, 'moved-fill');
        }
    }

    private hideLastMove(): void {
        console.log('hiding last move')
        for (const coord of this.getLastMoveCoords()) {
            console.log(coord)
            this.removeHighlight(coord);
        }
    }

    private getLastMoveCoords(): Coord[] {
        const move: HiveMove = this.rules.node.move.get();
        let lastMove: Coord[] = [];
        if (move instanceof HiveMoveDrop) {
            lastMove = [move.coord];
        } else if (move instanceof HiveMoveCoordToCoord) {
            lastMove = [move.coord, move.end];
        }
        // We need to offset the coordinates of the last move, in case the board has been extended in the negatives
        const offset: Vector = this.getState().offset;
       return lastMove.map((coord: Coord) => coord.getNext(offset));
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
        const size: number = this.getState().remainingPieces.getQuantity(piece);
        return `translate(${transform.x} ${transform.y - (this.PIECE_HEIGHT * size)})`;
    }

    private getRemainingPieceShift(piece: HivePiece): number {
        switch (piece.kind) {
            case 'QueenBee': return -2.5;
            case 'Beetle': return -1.5;
            case 'Grasshopper': return -0.5;
            case 'Spider': return 0.5;
            default:
                Utils.expectToBe(piece.kind, 'SoldierAnt', 'piece must be a soldier ant');
                return 1.5;
        }
    }

    public async selectRemaining(piece: HivePiece): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay(`#remainingPiece_${piece.toString() }`);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (piece.owner !== this.getCurrentPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (piece.kind !== 'QueenBee' && HiveRules.get().mustPlaceQueenBee(this.getState())) {
            return this.cancelMove(HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN());
        }

        if (this.selectedRemaining.equalsValue(piece)) {
            this.cancelMoveAttempt();
        } else {
            this.cancelMoveAttempt();
            if (this.rules.node.move.isPresent()) {
                this.hideLastMove();
            }
            this.selectedRemaining = MGPOptional.of(piece);
            for (const coord of HiveRules.get().getPossibleDropLocations(this.getState()).toList()) {
                this.highlightGroundStrokeIfShown(coord, 'clickable-stroke');
            }
        }
        return MGPValidation.SUCCESS;
    }

    public selectStack(x: number, y: number): Promise<MGPValidation> {
        return this.select(new Coord(x, y), 'piece');
    }

    public selectSpace(x: number, y: number): Promise<MGPValidation> {
        return this.select(new Coord(x, y), 'space');
    }

    private async select(coord: Coord, selection: 'piece' | 'space'): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay(`#${selection}_${coord.x}_${coord.y}`);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        if (this.rules.node.move.isPresent()) {
            this.hideLastMove();
        }
        const state: HiveState = this.getState();
        const stack: HivePieceStack = state.getAt(coord);
        if (this.selectedRemaining.isPresent()) {
            const move: HiveMove = HiveMove.drop(this.selectedRemaining.get(), coord);
            return this.chooseMove(move, state);
        }
        if (this.selectedStart.isPresent()) {
            const topPiece: HivePiece = state.getAt(this.selectedStart.get()).topPiece();
            if (this.selectedStart.equalsValue(coord)) {
                // Deselect the piece rather than trying a static move
                return this.cancelMove();
            } else {
                return this.selectTarget(coord, topPiece);
            }
        } else {
            if (stack.size() === 0) {
                return this.cancelMove();
            }
            return this.selectStart(coord, stack);
        }
    }

    private async selectTarget(coord: Coord, topPiece: HivePiece): Promise<MGPValidation> {
        if (topPiece.kind === 'Spider') {
            return this.selectNextSpiderSpace(coord);
        } else {
            const move: MGPFallible<HiveMove> = HiveMove.move(this.selectedStart.get(), coord);
            // static moves are prevented in selectSpace
            assert(move.isSuccess(), 'Hive: the only forbidden moves are static moves');
            return this.chooseMove(move.get(), this.getState());
        }
    }

    private async selectStart(coord: Coord, stack: HivePieceStack): Promise<MGPValidation> {
        const state: HiveState = this.getState();
        const piece: HivePiece = stack.topPiece();
        if (piece.owner !== state.getCurrentPlayer()) {
            if (stack.size() === 1) {
                return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            } else {
                // We will only inspect the opponent stack, not do a move
                this.highlight(coord, 'selected-stroke');
                this.inspectedStack = MGPOptional.of(stack);
                this.inspectedStackCoord = MGPOptional.of(coord);
                this.computeViewBox();
                return MGPValidation.SUCCESS;
            }
        }
        if (piece.kind !== 'QueenBee' && HiveRules.get().mustPlaceQueenBee(state)) {
            return this.cancelMove(HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN());
        }
        this.selectedStart = MGPOptional.of(coord);
        this.highlight(coord, 'selected-stroke');
        if (piece.kind === 'Spider') {
            this.selectedSpiderCoords.push(this.selectedStart.get());
        }
        if (stack.size() > 1) {
            this.inspectedStack = MGPOptional.of(stack);
            this.inspectedStackCoord = MGPOptional.of(coord);
            this.computeViewBox();
        }
        this.highlightNextPossibleCoords(coord);
        return MGPValidation.SUCCESS;
    }

    private highlightNextPossibleCoords(coord: Coord): void {
        for (const indicator of this.getNextPossibleCoords(coord)) {
            this.highlightIfPresent(indicator, 'clickable-stroke');
            this.highlightGroundStrokeIfShown(indicator, 'clickable-stroke');
        }
    }

    public getHighlightTransform(coord: Coord): string {
        const height: number = this.getState().getAt(coord).size() * this.PIECE_HEIGHT;
        return `translate(0 -${height})`;
    }

    private getNextPossibleCoords(coord: Coord): Coord[] {
        const state: HiveState = this.getState();
        const topPiece: HivePiece = state.getAt(coord).topPiece();
        const moves: MGPSet<HiveMoveCoordToCoord> = HiveRules.get().getPossibleMovesFrom(state, coord);
        if (topPiece.kind === 'Spider') {
            const spiderMoves: MGPSet<HiveMoveSpider> = moves as MGPSet<HiveMoveSpider>;
            return spiderMoves
                .filter((move: HiveMoveSpider) => ArrayUtils.isPrefix(this.selectedSpiderCoords, move.coords))
                .map((move: HiveMoveSpider) => move.coords[this.selectedSpiderCoords.length])
                .toList();
        } else {
            return moves.map((move: HiveMoveCoordToCoord) => move.end).toList();
        }
    }

    private async selectNextSpiderSpace(coord: Coord): Promise<MGPValidation> {
        this.selectedSpiderCoords.push(coord);
        this.highlight(coord, 'selected-stroke')
        if (this.selectedSpiderCoords.length === 4) {
            const move: HiveMove = HiveMove.spiderMove(this.selectedSpiderCoords as [Coord, Coord, Coord, Coord]);
            return this.chooseMove(move, this.getState());
        }
        const validity: MGPFallible<void> =
            HivePieceBehaviorSpider.get().prefixLegality(this.selectedSpiderCoords, this.getState());
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.highlightNextPossibleCoords(this.selectedStart.get());
        return MGPValidation.SUCCESS;
    }
}
