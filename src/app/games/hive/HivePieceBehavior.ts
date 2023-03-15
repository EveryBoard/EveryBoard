import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexagonalUtils } from 'src/app/jscaip/HexagonalUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { Utils } from 'src/app/utils/utils';
import { HiveFailure } from './HiveFailure';
import { HiveMoveCoordToCoord, HiveMoveSpider } from './HiveMove';
import { HivePiece, HivePieceKind, HivePieceStack } from './HivePiece';
import { HiveState } from './HiveState';

export abstract class HivePieceBehavior {

    private static INSTANCES: MGPOptional<Record<HivePieceKind, HivePieceBehavior>> = MGPOptional.empty();

    public static from(piece: HivePiece): HivePieceBehavior {
        if (HivePieceBehavior.INSTANCES.isAbsent()) {
            HivePieceBehavior.INSTANCES = MGPOptional.of({
                'QueenBee': HiveQueenBeeBehavior.get(),
                'Beetle': HiveBeetleBehavior.get(),
                'Grasshopper': HiveGrasshopperBehavior.get(),
                'Spider': HiveSpiderBehavior.get(),
                'SoldierAnt': HiveSoldierAntBehavior.get(),
            });
        }
        return HivePieceBehavior.INSTANCES.get()[piece.kind];
    }
    protected checkEmptyDestination(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (state.getAt(move.end).isNotEmpty()) {
            return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
        }
        return MGPFallible.success(undefined);
    }
    protected canSlideBetweenNeighbors(state: HiveState, start: Coord, end: Coord): boolean {
        // For the piece to slide from start to end,
        // one of the two common neighbors of start and end coord should be empty
        const startNeighbors: MGPSet<Coord> = new MGPSet(HexagonalUtils.getNeighbors(start));
        const endNeighbors: MGPSet<Coord> = new MGPSet(HexagonalUtils.getNeighbors(end));
        const commonNeighbors: MGPSet<Coord> = startNeighbors.intersection(endNeighbors);
        for (const neighbor of commonNeighbors) {
            if (state.getAt(neighbor).isEmpty()) {
                return true;
            }
        }
        return false;
    }
    public abstract moveLegality(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void>;

    public abstract getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[];
}

export class HiveQueenBeeBehavior extends HivePieceBehavior {

    private static INSTANCE: MGPOptional<HiveQueenBeeBehavior> = MGPOptional.empty();

    public static get(): HiveQueenBeeBehavior {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new HiveQueenBeeBehavior());
        }
        return this.INSTANCE.get();
    }
    public moveLegality(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (HexagonalUtils.areNeighbors(move.coord, move.end) === false) {
            return MGPFallible.failure(HiveFailure.QUEEN_BEE_CAN_ONLY_MOVE_TO_DIRECT_NEIGHBORS());
        }
        if (this.canSlideBetweenNeighbors(state, move.coord, move.end) === false) {
            return MGPFallible.failure(HiveFailure.MUST_BE_ABLE_TO_SLIDE());
        }
        return this.checkEmptyDestination(move, state);
    }
    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const moves: HiveMoveCoordToCoord[] = [];
        for (const neighbor of HexagonalUtils.getNeighbors(coord)) {
            if (state.getAt(neighbor).isEmpty()) {
                moves.push(HiveMoveCoordToCoord.from(coord, neighbor).get());
            }
        }
        return moves;
    }
}

export class HiveBeetleBehavior extends HivePieceBehavior {

    private static INSTANCE: MGPOptional<HiveBeetleBehavior> = MGPOptional.empty();

    public static get(): HiveBeetleBehavior {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new HiveBeetleBehavior());
        }
        return this.INSTANCE.get();
    }
    public moveLegality(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (HexagonalUtils.areNeighbors(move.coord, move.end) === false) {
            return MGPFallible.failure(HiveFailure.BEETLE_CAN_ONLY_MOVE_TO_DIRECT_NEIGHBORS());
        }
        return MGPFallible.success(undefined);
    }
    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const moves: HiveMoveCoordToCoord[] = [];
        for (const neighbor of HexagonalUtils.getNeighbors(coord)) {
            moves.push(HiveMoveCoordToCoord.from(coord, neighbor).get());
        }
        return moves;
    }
}

export class HiveGrasshopperBehavior extends HivePieceBehavior {

    private static INSTANCE: MGPOptional<HiveGrasshopperBehavior> = MGPOptional.empty();

    public static get(): HiveGrasshopperBehavior {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new HiveGrasshopperBehavior());
        }
        return this.INSTANCE.get();
    }
    public moveLegality(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {

        const direction: MGPFallible<HexaDirection> = HexaDirection.factory.fromMove(move.coord, move.end);
        if (direction.isFailure()) {
            return MGPFallible.failure(HiveFailure.GRASSHOPPER_MUST_MOVE_IN_STRAIGHT_LINE());
        }
        const jumpedCoords: Coord[] = move.coord.getCoordsToward(move.end);
        if (jumpedCoords.length === 0) {
            return MGPFallible.failure(HiveFailure.GRASSHOPPER_MUST_JUMP_OVER_PIECES());
        }
        for (const coord of jumpedCoords) {
            if (state.getAt(coord).isEmpty()) {
                return MGPFallible.failure(HiveFailure.GRASSHOPPER_MUST_JUMP_OVER_PIECES());
            }
        }
        return this.checkEmptyDestination(move, state);
    }
    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const moves: HiveMoveCoordToCoord[] = [];
        for (const direction of HexaDirection.factory.all) {
            const neighbor: Coord = coord.getNext(direction);
            if (state.getAt(neighbor).isNotEmpty()) {
                // We can jump in that direction
                let end: Coord = neighbor;
                while (state.getAt(end).isNotEmpty()) {
                    end = end.getNext(direction);
                }
                moves.push(HiveMoveCoordToCoord.from(coord, end).get());
            }
        }
        return moves;
    }
}

export class HiveSpiderBehavior extends HivePieceBehavior {

    private static INSTANCE: MGPOptional<HiveSpiderBehavior> = MGPOptional.empty();

    public static get(): HiveSpiderBehavior {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new HiveSpiderBehavior());
        }
        return this.INSTANCE.get();
    }
    public prefixLegality(coords: Coord[], state: HiveState): MGPFallible<void> {
        const visited: MGPSet<Coord> = new MGPSet();
        for (let i: number = 1; i < coords.length; i++) {
            if (state.getAt(coords[i]).isNotEmpty()) {
                return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
            }
            if (HexagonalUtils.areNeighbors(coords[i-1], coords[i]) === false) {
                return MGPFallible.failure(HiveFailure.SPIDER_MUST_MOVE_ON_NEIGHBORING_SPACES());
            }
            if (state.haveCommonNeighbor(coords[i], coords[i-1]) === false) {
                return MGPFallible.failure(HiveFailure.SPIDER_CAN_ONLY_MOVE_WITH_DIRECT_CONTACT());
            }
            if (this.canSlideBetweenNeighbors(state, coords[i-1], coords[i]) === false) {
                return MGPFallible.failure(HiveFailure.MUST_BE_ABLE_TO_SLIDE());
            }
            if (visited.contains(coords[i])) {
                return MGPFallible.failure(HiveFailure.SPIDER_CANNOT_BACKTRACK());
            }
            visited.add(coords[i]);
        }
        return MGPFallible.success(undefined);
    }
    public moveLegality(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        Utils.assert(move instanceof HiveMoveSpider, 'move should be a spider move');
        const spiderMove: HiveMoveSpider = move as HiveMoveSpider;
        const prefixLegality: MGPFallible<void> = this.prefixLegality(spiderMove.coords, state);
        if (prefixLegality.isFailure()) {
            return prefixLegality;
        }
        return this.checkEmptyDestination(move, state);
    }
    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const stateWithoutMovedSpider: HiveState = state.update()
            .setAt(coord, HivePieceStack.EMPTY)
            .increaseTurnAndFinalizeUpdate();

        let movesSoFar: Coord[][] = [[coord]];
        for (let i: number = 0; i < 3; i++) {
            movesSoFar = movesSoFar.flatMap((move: Coord[]) => this.nextMoveStep(stateWithoutMovedSpider, move));
        }
        function makeMove(move: Coord[]): HiveMoveSpider {
            return HiveMoveSpider.fromCoords(move as [Coord, Coord, Coord, Coord]);
        }
        const uniqueMoves: MGPSet<HiveMoveCoordToCoord> = new MGPSet(movesSoFar.map(makeMove));
        return uniqueMoves.toList();
    }
    private nextMoveStep(state: HiveState, move: Coord[]): Coord[][] {
        const lastCoord: Coord = move[move.length - 1];
        function neighborsFilter(coord: Coord): boolean {
            if (state.getAt(coord).isNotEmpty()) {
                // We can only go through empty spaces
                return false;
            }
            if (move.find((c: Coord) => coord.equals(c)) !== undefined) {
                // We cannot backtrack
                return false;
            }
            // Must have a common neighbor with the previous coord
            return state.haveCommonNeighbor(coord, lastCoord);
        };
        const possibleNeighbors: MGPSet<Coord> =
            new MGPSet(HexagonalUtils.getNeighbors(lastCoord)).filter(neighborsFilter);
        return possibleNeighbors.toList().map((coord: Coord): Coord[] => [...move, coord]);
    }
}

export class HiveSoldierAntBehavior extends HivePieceBehavior {

    private static INSTANCE: MGPOptional<HiveSoldierAntBehavior> = MGPOptional.empty();

    public static get(): HiveSoldierAntBehavior {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new HiveSoldierAntBehavior());
        }
        return this.INSTANCE.get();
    }
    public pathExists(state: HiveState, start: Coord, end: Coord): boolean {
        const visited: MGPSet<Coord> = new MGPSet();
        const worklist: Coord[] = [start];
        while (worklist.length > 0) {
            const coord: Coord = worklist.pop() as Coord;
            if (visited.contains(coord)) {
                continue;
            }
            visited.add(coord);

            if (coord.equals(end)) {
                return true;
            }
            for (const neighbor of HexagonalUtils.getNeighbors(coord)) {
                const isEmpty: boolean = state.getAt(neighbor).isEmpty();
                const hasOccupiedNeighbors: boolean = state.getOccupiedNeighbors(neighbor).size() > 0;
                const canSlide: boolean = this.canSlideBetweenNeighbors(state, coord, neighbor);
                if (isEmpty && hasOccupiedNeighbors && canSlide) {
                    worklist.push(neighbor);
                }
            }
        }
        return false;
    }
    public moveLegality(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (this.pathExists(state, move.coord, move.end) === false) {
            return MGPFallible.failure(HiveFailure.MUST_BE_ABLE_TO_SLIDE());
        }
        return this.checkEmptyDestination(move, state);
    }
    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const moves: MGPSet<HiveMoveCoordToCoord> = new MGPSet();
        for (const occupiedSpace of state.occupiedSpaces()) {
            if (occupiedSpace.equals(coord)) {
                // We will move so we don't look at this space
                continue;
            }
            for (const unoccupied of state.emptyNeighbors(occupiedSpace)) {
                moves.add(HiveMoveCoordToCoord.from(coord, unoccupied).get());
            }
        }
        return moves.toList();
    }
}
