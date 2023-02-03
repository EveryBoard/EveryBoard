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

export abstract class HivePieceBehaviour {

    private static INSTANCES: MGPOptional<Record<HivePieceKind, HivePieceBehaviour>> = MGPOptional.empty();

    public static from(piece: HivePiece): HivePieceBehaviour {
        if (HivePieceBehaviour.INSTANCES.isAbsent()) {
            HivePieceBehaviour.INSTANCES = MGPOptional.of({
                'QueenBee': HivePieceBehaviourQueenBee.get(),
                'Beetle': HivePieceBehaviourBeetle.get(),
                'Grasshopper': HivePieceBehaviourGrasshopper.get(),
                'Spider': HivePieceBehaviourSpider.get(),
                'SoldierAnt': HivePieceBehaviourSoldierAnt.get(),
            });
        }
        return HivePieceBehaviour.INSTANCES.get()[piece.kind];
    }

    protected destinationIsEmpty(move: HiveMoveCoordToCoord, state: HiveState): boolean {
        return state.getAt(move.end).isEmpty();
    }

    protected canSlide(state: HiveState, start: Coord, end: Coord): boolean {
        // For the piece to slide from start to end,
        // one of the two common neighbors of start and end coord should be empty
        const startNeighbors: MGPSet<Coord> = new MGPSet(HexagonalUtils.neighbors(start));
        const endNeighbors: MGPSet<Coord> = new MGPSet(HexagonalUtils.neighbors(end));
        const commonNeighbors: MGPSet<Coord> = startNeighbors.intersect(endNeighbors);
        for (const neighbor of commonNeighbors) {
            if (state.getAt(neighbor).isEmpty()) {
                return true;
            }
        }
        return false;
    }

    public abstract moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void>

    public abstract getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[]

}

export class HivePieceBehaviourQueenBee extends HivePieceBehaviour {

    private static INSTANCE: MGPOptional<HivePieceBehaviourQueenBee> = MGPOptional.empty();

    public static get(): HivePieceBehaviourQueenBee {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new this());
        }
        return this.INSTANCE.get();
    }


    public moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (HexagonalUtils.areNeighbors(move.coord, move.end) === false) {
            return MGPFallible.failure(HiveFailure.QUEEN_BEE_CAN_ONLY_MOVE_TO_DIRECT_NEIGHBORS());
        }
        if (this.destinationIsEmpty(move, state) === false) {
            return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
        }
        if (this.canSlide(state, move.coord, move.end) === false) {
            return MGPFallible.failure(HiveFailure.MUST_BE_ABLE_TO_SLIDE());
        }
        return MGPFallible.success(undefined);
    }

    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const moves: HiveMoveCoordToCoord[] = [];
        for (const neighbor of HexagonalUtils.neighbors(coord)) {
            if (state.getAt(neighbor).isEmpty()) {
                moves.push(HiveMoveCoordToCoord.from(coord, neighbor).get());
            }
        }
        return moves;
    }
}

export class HivePieceBehaviourBeetle extends HivePieceBehaviour {

    private static INSTANCE: MGPOptional<HivePieceBehaviourBeetle> = MGPOptional.empty();

    public static get(): HivePieceBehaviourBeetle {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new this());
        }
        return this.INSTANCE.get();
    }


    public moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (HexagonalUtils.areNeighbors(move.coord, move.end) === false) {
            return MGPFallible.failure(HiveFailure.BEETLE_CAN_ONLY_MOVE_TO_DIRECT_NEIGHBORS());
        }
        return MGPFallible.success(undefined);
    }

    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const moves: HiveMoveCoordToCoord[] = [];
        for (const neighbor of HexagonalUtils.neighbors(coord)) {
            moves.push(HiveMoveCoordToCoord.from(coord, neighbor).get());
        }
        return moves;
    }
}

export class HivePieceBehaviourGrasshopper extends HivePieceBehaviour {

    private static INSTANCE: MGPOptional<HivePieceBehaviourGrasshopper> = MGPOptional.empty();

    public static get(): HivePieceBehaviourGrasshopper {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new this());
        }
        return this.INSTANCE.get();
    }


    public moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {

        const direction: MGPFallible<HexaDirection> = HexaDirection.factory.fromMove(move.coord, move.end);
        if (direction.isFailure()) {
            return MGPFallible.failure(HiveFailure.GRASSHOPPER_MUST_MOVE_IN_STRAIGHT_LINE());
        }
        if (this.destinationIsEmpty(move, state) === false) {
            return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
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
        return MGPFallible.success(undefined);
    }
    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const moves: HiveMoveCoordToCoord[] = [];
        for (const neighbor of HexagonalUtils.neighbors(coord)) {
            if (state.getAt(neighbor).isEmpty() === false) {
                // We can jump in that direction
                const direction: HexaDirection = HexaDirection.factory.fromMove(coord, neighbor).get();
                let end: Coord = neighbor;
                while (state.getAt(end).isEmpty() === false) {
                    end = end.getNext(direction);
                }
                moves.push(HiveMoveCoordToCoord.from(coord, end).get());
            }
        }
        return moves;
    }
}

export class HivePieceBehaviourSpider extends HivePieceBehaviour {

    private static INSTANCE: MGPOptional<HivePieceBehaviourSpider> = MGPOptional.empty();

    public static get(): HivePieceBehaviourSpider {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new this());
        }
        return this.INSTANCE.get();
    }

    public prefixValidity(coords: Coord[], state: HiveState): MGPFallible<void> {
        const visited: MGPSet<Coord> = new MGPSet();
        for (let i: number = 1; i < coords.length; i++) {
            if (state.getAt(coords[i]).isEmpty() === false) {
                return MGPFallible.failure(HiveFailure.SPIDER_CAN_ONLY_MOVE_ON_EMPTY_SPACES());
            }
            if (HexagonalUtils.areNeighbors(coords[i-1], coords[i]) === false) {
                return MGPFallible.failure(HiveFailure.SPIDER_MUST_MOVE_OF_3_NEIGHBORS());
            }
            if (this.haveCommonNeighbor(state, coords[i], coords[i-1]) === false) {
                return MGPFallible.failure(HiveFailure.SPIDER_CAN_ONLY_MOVE_WITH_DIRECT_CONTACT());
            }
            if (this.canSlide(state, coords[i-1], coords[i]) === false) {
                return MGPFallible.failure(HiveFailure.MUST_BE_ABLE_TO_SLIDE());
            }
            if (visited.contains(coords[i])) {
                return MGPFallible.failure(HiveFailure.SPIDER_CANNOT_BACKTRACK());
            }
            visited.add(coords[i]);
        }
        return MGPFallible.success(undefined);
    }

    public moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (this.destinationIsEmpty(move, state) === false) {
            return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
        }

        Utils.assert(move instanceof HiveMoveSpider, 'move should be a spider move');
        const spiderMove: HiveMoveSpider = move as HiveMoveSpider;
        return this.prefixValidity(spiderMove.coords, state);
    }

    private haveCommonNeighbor(state: HiveState, coord1: Coord, coord2: Coord): boolean {
        return state.getOccupiedNeighbors(coord1).findCommonElement(state.getOccupiedNeighbors(coord2)).isPresent();
    }

    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const stateWithoutSpider: HiveState = state.getCopy();
        stateWithoutSpider.setAt(coord, HivePieceStack.EMPTY);

        let moves: Coord[][] = [[coord]];
        for (let i: number = 0; i < 3; i++) {
            moves = moves.flatMap((move: Coord[]) => {
                const lastCoord: Coord = move[move.length - 1];
                return new MGPSet(HexagonalUtils.neighbors(lastCoord))
                    .filter((coord: Coord): boolean =>
                        // We can only go through empty spaces
                        stateWithoutSpider.getAt(coord).isEmpty() &&
                        // We cannot backtrack
                        move.find((coord2: Coord) => coord.equals(coord2)) === undefined &&
                        // Must have a common neighbor with the previous coord
                        this.haveCommonNeighbor(stateWithoutSpider, coord, lastCoord))
                    .toList()
                    .map((coord: Coord): Coord[] => [...move, coord]);
            });
        }
        return moves.map((move: Coord[]) => HiveMoveSpider.fromCoords(move as [Coord, Coord, Coord, Coord]).get());
    }
}

export class HivePieceBehaviourSoldierAnt extends HivePieceBehaviour {

    private static INSTANCE: MGPOptional<HivePieceBehaviourSoldierAnt> = MGPOptional.empty();

    public static get(): HivePieceBehaviourSoldierAnt {
        if (this.INSTANCE.isAbsent()) {
            this.INSTANCE = MGPOptional.of(new this());
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
            for (const neighbor of HexagonalUtils.neighbors(coord)) {
                const isEmpty: boolean = state.getAt(neighbor).isEmpty();
                const hasOccupiedNeighbors: boolean = state.getOccupiedNeighbors(neighbor).size() > 0;
                const canSlide: boolean = this.canSlide(state, coord, neighbor);
                if (isEmpty && hasOccupiedNeighbors && canSlide) {
                    worklist.push(neighbor);
                }
            }
        }
        return false;
    }

    public moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (this.destinationIsEmpty(move, state) === false) {
            return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
        }
        if (this.pathExists(state, move.coord, move.end) === false) {
            return MGPFallible.failure(HiveFailure.MUST_BE_ABLE_TO_SLIDE());
        }
        return MGPFallible.success(undefined);
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
