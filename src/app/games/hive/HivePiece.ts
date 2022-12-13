import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexagonalUtils } from 'src/app/jscaip/HexagonalUtils';
import { Player } from 'src/app/jscaip/Player';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPSet } from 'src/app/utils/MGPSet';
import { Utils } from 'src/app/utils/utils';
import { HiveFailure } from './HiveFailure';
import { HiveMoveCoordToCoord, HiveMoveSpider } from './HiveMove';
import { HiveState } from './HiveState';

type HivePieceKind = 'QueenBee' | 'Beetle' | 'Grasshopper' | 'Spider' | 'SoldierAnt'

export abstract class HivePiece implements ComparableObject {

    protected constructor(public readonly owner: Player,
                          private readonly kind: HivePieceKind,
                          public readonly canClimb: boolean,
                          public readonly mustHaveFreedomToMove: boolean)
    {
    }

    public equals(other: HivePiece): boolean {
        return this.owner === other.owner && this.kind === other.kind;
    }

    protected destinationIsEmpty(move: HiveMoveCoordToCoord, state: HiveState): boolean {
        return state.getAt(move.end).isEmpty();
    }

    public abstract moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void>

    public abstract getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[]
}

export class HivePieceQueenBee extends HivePiece {

    public constructor(owner: Player) {
        super(owner, 'QueenBee', false, true);
    }

    public moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (HexagonalUtils.areNeighbors(move.coord, move.end) === false) {
            return MGPFallible.failure(HiveFailure.QUEEN_BEE_CAN_ONLY_MOVE_TO_DIRECT_NEIGHBORS());
        }
        if (this.destinationIsEmpty(move, state) === false) {
            return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
        }
        return MGPFallible.success(undefined);
    }

    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const moves: HiveMoveCoordToCoord[] = [];
        for (const neighbor of HexagonalUtils.neighbors(coord)) {
            if (state.getAt(neighbor).isEmpty()) {
                moves.push(new HiveMoveCoordToCoord(coord, neighbor));
            }
        }
        return moves;
    }
}


export class HivePieceBeetle extends HivePiece {

    public constructor(owner: Player) {
        super(owner, 'Beetle', true, false);
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
            moves.push(new HiveMoveCoordToCoord(coord, neighbor));
        }
        return moves;
    }
}

export class HivePieceGrasshopper extends HivePiece {

    public constructor(owner: Player) {
        super(owner, 'Grasshopper', false, false);
    }

    public moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {

        const direction: MGPFallible<HexaDirection> = HexaDirection.factory.fromMove(move.coord, move.end);
        if (direction.isFailure()) {
            return MGPFallible.failure(HiveFailure.GRASSHOPPER_MUST_MOVE_IN_STRAIGHT_LINE());
        }
        if (this.destinationIsEmpty(move, state) === false) {
            return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
        }
        for (const coord of move.coord.getCoordsToward(move.end)) {
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
                moves.push(new HiveMoveCoordToCoord(coord, end));
            }
        }
        return moves;
    }
}


export class HivePieceSpider extends HivePiece {

    public constructor(owner: Player) {
        super(owner, 'Spider', false, true);
    }

    public moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (this.destinationIsEmpty(move, state) === false) {
            return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
        }

        Utils.assert(move instanceof HiveMoveSpider, 'move should be a spider move');
        const spiderMove: HiveMoveSpider = move as HiveMoveSpider;
        const visited: MGPSet<Coord> = new MGPSet();
        for (let i: number = 1; i <= 3; i++) {
            if (state.getAt(spiderMove.coords[i]).isEmpty() === false) {
                return MGPFallible.failure(HiveFailure.SPIDER_CAN_ONLY_MOVE_ON_EMPTY_SPACES());
            }
            if (HexagonalUtils.areNeighbors(spiderMove.coords[i-1], spiderMove.coords[i]) === false) {
                return MGPFallible.failure(HiveFailure.SPIDER_MUST_MOVE_OF_3_NEIGHBORS());
            }
            if (this.haveCommonNeighbor(state, spiderMove.coords[i], spiderMove.coords[i-1])) {
                return MGPFallible.failure(HiveFailure.SPIDER_CAN_ONLY_MOVE_WITH_DIRECT_CONTACT());
            }
            if (visited.contains(spiderMove.coords[i])) {
                return MGPFallible.failure(HiveFailure.SPIDER_CANNOT_BACKTRACK());
            }
            visited.add(spiderMove.coords[i]);
        }
        return MGPFallible.success(undefined);
    }

    private haveCommonNeighbor(state: HiveState, coord1: Coord, coord2: Coord): boolean {
        const occupiedNeighbors: MGPSet<Coord> = state.getOccupiedNeighbors(coord1);
        const previousOccupiedNeighbors: MGPSet<Coord> = state.getOccupiedNeighbors(coord2);
        return occupiedNeighbors.findCommonElement(previousOccupiedNeighbors).isPresent();
    }

    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        let moves: Coord[][] = [[coord]];
        for (let i: number = 0; i < 3; i++) {
            moves = moves.flatMap((move: Coord[]) => {
                const lastCoord: Coord = move[move.length - 1];
                return new MGPSet(HexagonalUtils.neighbors(lastCoord))
                    .filter((coord: Coord): boolean =>
                        // We can only go through empty spaces
                        state.getAt(coord).isEmpty() &&
                        // We cannot backtrack
                        move.find((coord2: Coord) => coord.equals(coord2)) === undefined &&
                        // Must have a common neighbor with the previous coord
                        this.haveCommonNeighbor(state, coord, lastCoord))
                    .toList()
                    .map((coord: Coord): Coord[] => [...move, coord]);
            });
        }
        return moves.map((move: Coord[]) => new HiveMoveSpider(move as [Coord, Coord, Coord, Coord]));
    }
}

export class HivePieceSoldierAnt extends HivePiece {

    public constructor(owner: Player) {
        super(owner, 'SoldierAnt', false, true);
    }

    public moveValidity(move: HiveMoveCoordToCoord, state: HiveState): MGPFallible<void> {
        if (this.destinationIsEmpty(move, state) === false) {
            return MGPFallible.failure(HiveFailure.THIS_PIECE_CANNOT_CLIMB());
        }

        return MGPFallible.success(undefined);
    }

    public getPossibleMoves(coord: Coord, state: HiveState): HiveMoveCoordToCoord[] {
        const moves: MGPSet<HiveMoveCoordToCoord> = new MGPSet();
        for (const occupiedSpace of state.occupiedSpaces()) {
            for (const unoccupied of state.emptyNeighbors(occupiedSpace)) {
                moves.add(new HiveMoveCoordToCoord(coord, unoccupied));
            }
        }
        return moves.toList();
    }
}

export class HivePieceStack implements ComparableObject {
    public static EMPTY: HivePieceStack = new HivePieceStack([]);

    public constructor(public readonly pieces: HivePiece[]) {
    }

    public equals(other: HivePieceStack): boolean {
        if (this.pieces.length !== other.pieces.length) return false;
        for (let i: number = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].equals(other.pieces[i]) === false) {
                return false;
            }
        }
        return true;
    }

    public isEmpty(): boolean {
        return this.pieces.length === 0;
    }

    public add(piece: HivePiece): HivePieceStack {
        return new HivePieceStack([piece, ...this.pieces]);
    }

    public topPiece(): HivePiece {
        Utils.assert(this.isEmpty() === false, 'HivePieceStack: cannot get top piece of an empty stack');
        return this.pieces[0];
    }

    public removeTopPiece(): HivePieceStack {
        const pieces: HivePiece[] = [...this.pieces];
        pieces.shift();
        return new HivePieceStack(pieces);
    }
}
