import { Component } from '@angular/core';
import { HexagonalGameComponent } from 'src/app/components/game-components/game-component/HexagonalGameComponent';
import { Coord } from 'src/app/jscaip/Coord';
import { HexaLayout } from 'src/app/jscaip/HexaLayout';
import { FlatHexaOrientation } from 'src/app/jscaip/HexaOrientation';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MessageDisplayer } from 'src/app/services/MessageDisplayer';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Utils } from 'src/app/utils/utils';
import { HiveDummyMinimax } from './HiveDummyMinimax';
import { HiveMove } from './HiveMove';
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

    public remainingPieces: [HivePiece, number][] = [];
    private remainingPiecesPositions: { left: number, top: number, bottom: number };
    public pieces: PieceWithCoord[] = [];
    public neighbors: Coord[] = [];

    private selectedRemaining: MGPOptional<HivePiece> = MGPOptional.empty();
    private selectedStart: MGPOptional<Coord> = MGPOptional.empty();
    private selectedSpiderCoords: Coord[] = [];

    public PIECE_HEIGHT: number;

    public selected: { coord: Coord, height: number }[] = [];

    public viewBox: string;

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
        this.computeViewBoxAndRemainingCoords();
        this.remainingPieces = this.getState().remainingPieces.toList();
    }

    private computeViewBoxAndRemainingCoords(): void {
        this.viewBox = this.getViewBox();
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
    }

    public computeRemainingPiecesPosition(): Coord[] {
        let left: number = 0;
        let above: number = 0;
        let below: number = 0;
        for (const coord of this.getState().occupiedSpaces()) {
            if (coord.x < left) left = coord.x;
            if (coord.y < above) above = coord.y;
            if (coord.y > below) below = coord.y;
        }
        // Remaining pieces will appear on the left
        const minX: number = left;
        // There can be up to 5 types of remaining pieces
        const maxX: number = left + 4;
        // Pieces will be above and below, one space away from the board
        const minY: number = above - 2;
        const maxY: number = below + 2;

        this.remainingPiecesPositions = { left, top: minY, bottom: maxY };
        return [new Coord(minX*2, minY), new Coord(maxX*2, maxY)];
    }


    public getRemainingPieceCoord(piece: HivePiece): Coord {
        const x: number = this.getRemainingPieceShift(piece);

        // TODO: change based on role
        if (piece.owner === Player.ZERO) {
            // Player zero is below
            return new Coord(x*2, this.remainingPiecesPositions.bottom-x);
        } else {
            // Player one is above
            return new Coord(x*2, this.remainingPiecesPositions.top-x);
        }
    }

    private getRemainingPieceShift(piece: HivePiece): number {
        if (piece instanceof HivePieceQueenBee) return 0;
        if (piece instanceof HivePieceBeetle) return 1;
        if (piece instanceof HivePieceGrasshopper) return 2;
        if (piece instanceof HivePieceSpider) return 3;
        Utils.assert(piece instanceof HivePieceSoldierAnt, 'piece must be a soldier ant');
        return 4;
    }

    public async selectRemaining(piece: HivePiece): Promise<MGPValidation> {
        this.cancelMoveAttempt();
        if (piece.owner !== this.getCurrentPlayer()) {
            return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        this.selectedRemaining = MGPOptional.of(piece);
        this.selected.push({ coord: this.getRemainingPieceCoord(piece), height: 1 }) // TODO
        return MGPValidation.SUCCESS;
    }

    public isRemainingSelected(piece: HivePiece): boolean {
        return this.selectedRemaining.equalsValue(piece);
    }

    public async selectSpace(coord: Coord): Promise<MGPValidation> {
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
            if (stack.topPiece().owner !== state.getCurrentPlayer()) {
                return this.cancelMove(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            }
            this.selectedStart = MGPOptional.of(coord);
            this.selected.push({ coord, height: stack.size() });
        }
        return MGPValidation.SUCCESS;
    }

    private async selectNextSpiderSpace(coord: Coord, spider: HivePieceSpider): Promise<MGPValidation> {
        if (this.selectedSpiderCoords.length === 0) {
            this.selectedSpiderCoords.push(this.selectedStart.get());
        }
        this.selectedSpiderCoords.push(coord);
        if (this.selectedSpiderCoords.length === 4) {
            const move: HiveMove = HiveMove.spiderMove(this.selectedSpiderCoords as [Coord, Coord, Coord, Coord]);
            return this.chooseMove(move, this.getState());
        }
        const validity: MGPFallible<void> = spider.prefixValidity(this.selectedSpiderCoords.reverse(), this.getState());
        if (validity.isFailure()) {
            return this.cancelMove(validity.getReason());
        }
        return MGPValidation.SUCCESS;
    }

    public isSelected(coord: Coord): boolean {
        if (this.selectedStart.equalsValue(coord)) return true;
        if (this.selectedSpiderCoords.some((selected: Coord) => selected.equals(coord))) return true;
        return false;
    }

    // TODO: the rest here is stolen from SixComponent, try to generalize this
    private getViewBox(): string {
        const hexaCoords: Coord[] = this.mapAbstractCoordToCornerCoords();
        const limits: Limits = this.getLimits(hexaCoords);
        const left: number = limits.minX - (this.STROKE_WIDTH / 2);
        const up: number = limits.minY - (this.STROKE_WIDTH / 2);
        const width: number = this.STROKE_WIDTH + limits.maxX - limits.minX;
        const height: number = this.STROKE_WIDTH + limits.maxY - limits.minY;
        return left + ' ' + up + ' ' + width + ' ' + height;
    }
    private mapAbstractCoordToCornerCoords(): Coord[] {
        const abstractCoords: Coord[] =
            this.pieces.map((piece: PieceWithCoord) => piece.coord)
                .concat(this.neighbors)
                .concat(this.computeRemainingPiecesPosition());
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
