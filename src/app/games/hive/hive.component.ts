import { Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { ViewBox } from 'src/app/components/game-components/GameComponentUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
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
import { HiveFailure } from './HiveFailure';
import { HiveMinimax } from './HiveMinimax';
import { HiveMove, HiveMoveCoordToCoord, HiveMoveDrop, HiveMoveSpider } from './HiveMove';
import { HivePiece, HivePieceStack } from './HivePiece';
import { HivePieceBehaviorSpider } from './HivePieceBehavior';
import { HiveRules } from './HiveRules';
import { HiveState } from './HiveState';
import { HiveTutorial } from './HiveTutorial';

interface StackAndCoord {
    stack: HivePieceStack;
    coord: Coord;
}

@Component({
    selector: 'app-hive',
    templateUrl: './hive.component.html',
    styleUrls: ['../../components/game-components/game-component/game-component.scss'],
})
export class HiveComponent extends HexagonalGameComponent<HiveRules, HiveMove, HiveState, HivePieceStack> {

    public readonly ORIGIN: Coord = new Coord(0, 0);

    public remainingPieces: HivePieceStack[] = [];
    public pieces: StackAndCoord[] = [];
    public neighbors: Coord[] = [];
    public indicators: Coord[] = [];
    public lastMove: Coord[] = [];

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
            this.pieces.push({ coord, stack });
        }
        this.pieces.sort((a: StackAndCoord, b: StackAndCoord): number => {
            if (a.coord.y === b.coord.y) return a.coord.x - b.coord.x;
            else return a.coord.y - b.coord.y;
        });
        this.neighbors = this.getAllNeighbors();
        this.computeViewBox();
        this.remainingPieces = this.getState().remainingPieces.toListOfStacks();
        this.canPass = HiveRules.get().shouldPass(this.getState());
        this.hideLastMove();
        if (this.rules.node.move.isPresent()) {
            this.showLastMove();
        }
    }

    public async pass(): Promise<MGPValidation> {
        Utils.assert(this.canPass, 'DvonnComponent: pass() can only be called if canPass is true');
        return await this.chooseMove(HiveMove.PASS, this.getState());
    }

    private computeViewBox(): void {
        const coords: Coord[] = this.pieces.map((stack: StackAndCoord) => stack.coord).concat(this.neighbors);
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
            this.inspectedStackTransform = `translate(${inspectedStackPosition.x} ${inspectedStackPosition.y})`;

            const spaceForInspectedStack: number = this.SPACE_SIZE*5;
            console.log({spaceForInspectedStack})
            console.log('expanding')
            this.viewBox = boardAndRemainingViewBox.expand(0, spaceForInspectedStack, 0, 0).toSVGString();
        } else {
            this.viewBox = boardAndRemainingViewBox.toSVGString();
        }
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
        if (this.rules.node.move.isPresent()) {
            this.showLastMove();
        }
        this.computeViewBox();
    }

    private showLastMove(): void {
        const move: HiveMove = this.rules.node.move.get();
        if (move instanceof HiveMoveDrop) {
            this.lastMove = [move.coord];
        } else if (move instanceof HiveMoveCoordToCoord) {
            this.lastMove = [move.coord, move.end];
        }
        // We need to offset the coordinates of the last move, in case the board has been extended in the negatives
        console.log('showing last move')
        const offset: Vector = this.getState().offset;
        console.log(offset)
        this.lastMove = this.lastMove.map((coord: Coord) => coord.getNext(offset));
    }

    public hideLastMove(): void {
        this.lastMove = [];
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
            this.hideLastMove();
            this.selectedRemaining = MGPOptional.of(piece);
            this.indicators = HiveRules.get().getPossibleDropLocations(this.getState()).toList();
        }
        return MGPValidation.SUCCESS;
    }

    public selectStack(coord: Coord): Promise<MGPValidation> {
        return this.selectSpace(coord, 'piece');
    }

    public selectNeighbor(coord: Coord): Promise<MGPValidation> {
        return this.selectSpace(coord, 'space');
    }

    private async selectSpace(coord: Coord, selection: 'piece' | 'space'): Promise<MGPValidation> {
        const clickValidity: MGPValidation = this.canUserPlay(`#${selection}_${coord.x}_${coord.y}`);
        if (clickValidity.isFailure()) {
            return this.cancelMove(clickValidity.getReason());
        }
        this.hideLastMove();
        const state: HiveState = this.getState();
        const stack: HivePieceStack = state.getAt(coord);
        if (this.selectedRemaining.isPresent()) {
            const move: HiveMove = HiveMove.drop(this.selectedRemaining.get(), coord);
            return this.chooseMove(move, state);
        }
        if (this.selectedStart.isPresent()) {
            const topPiece: HivePiece = state.getAt(this.selectedStart.get()).topPiece();
            if (this.selectedStart.equalsValue(coord)) {
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
            if (move.isFailure()) {
                return this.cancelMove(move.getReason());
            } else {
                return this.chooseMove(move.get(), this.getState());
            }
        }
    }

    private async selectStart(coord: Coord, stack: HivePieceStack): Promise<MGPValidation> {
        const state: HiveState = this.getState();
        const piece: HivePiece = stack.topPiece();
        if (piece.owner !== state.getCurrentPlayer()) {
            if (stack.size() === 1) {
                return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            } else if (this.inspectedStack.isPresent()) {
                this.inspectedStack = MGPOptional.empty();
                this.cancelMoveAttempt();
                this.computeViewBox();
            } else {
                // We will only inspect the opponent stack, not do a move
                this.selected.push(coord);
                this.inspectedStack = MGPOptional.of(stack);
                this.computeViewBox();
                return MGPValidation.SUCCESS;
            }
        }
        if (piece.kind !== 'QueenBee' && HiveRules.get().mustPlaceQueenBee(state)) {
            return this.cancelMove(HiveFailure.MUST_PLACE_QUEEN_BEE_LATEST_AT_FOURTH_TURN());
        }
        this.selectedStart = MGPOptional.of(coord);
        this.selected.push(coord);
        if (piece.kind === 'Spider') {
            this.selectedSpiderCoords.push(this.selectedStart.get());
        }
        if (stack.size() > 1) {
            this.inspectedStack = MGPOptional.of(stack);
        }
        this.indicators = this.getNextPossibleCoords(coord);
        return MGPValidation.SUCCESS;
    }

    public highlightGround(coord: Coord): boolean {
        return this.getState().getAt(coord).isEmpty();
    }

    public getHighlightTransform(coord: Coord): string {
        const height: number = this.getState().getAt(coord).size() * this.PIECE_HEIGHT;
        return `translate(0 -${height})`;
    }

    public isIndicator(coord: Coord): boolean {
        return this.indicators.some((indicator: Coord) => coord.equals(indicator));
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
        this.selected.push(coord);
        if (this.selectedSpiderCoords.length === 4) {
            const move: HiveMove = HiveMove.spiderMove(this.selectedSpiderCoords as [Coord, Coord, Coord, Coord]).get();
            return this.chooseMove(move, this.getState());
        }
        const validity: MGPFallible<void> =
            HivePieceBehaviorSpider.get().prefixLegality(this.selectedSpiderCoords, this.getState());
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        this.indicators = this.getNextPossibleCoords(this.selectedStart.get());
        return MGPValidation.SUCCESS;
    }
}
