import { Coord } from 'src/app/jscaip/Coord';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexagonalUtils } from 'src/app/jscaip/HexagonalUtils';
import { Player } from 'src/app/jscaip/Player';
import { assert } from 'src/app/utils/assert';
import { ComparableObject } from 'src/app/utils/Comparable';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPSet } from 'src/app/utils/MGPSet';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { HiveFailure } from './HiveFailure';
import { HiveMoveCoordToCoord, HiveMoveSpider } from './HiveMove';
import { HiveState } from './HiveState';

type HivePieceKind = 'QueenBee' | 'Beetle' | 'Grasshopper' | 'Spider' | 'SoldierAnt'

export abstract class HivePiece implements ComparableObject {

    public static encoder: Encoder<HivePiece> = new class extends Encoder<HivePiece> {

        public encode(piece: HivePiece): JSONValue {
            return { owner: piece.owner.value, kind: piece.kind };
        }

        public decode(encoded: JSONValue): HivePiece {
            // eslint-disable-next-line dot-notation
            assert(Utils.getNonNullable(encoded)['kind'] !== null, 'invalid encoded HivePiece');
            // eslint-disable-next-line dot-notation
            assert(Utils.getNonNullable(encoded)['owner'] !== null, 'invalid encoded HivePiece');
            // eslint-disable-next-line dot-notation
            const kind: string = Utils.getNonNullable(encoded)['kind'] as HivePieceKind;
            // eslint-disable-next-line dot-notation
            const owner: Player = Player.of(Utils.getNonNullable(encoded)['owner']);
            switch (kind) {
                case 'QueenBee': return new HivePieceQueenBee(owner);
                case 'Beetle': return new HivePieceBeetle(owner);
                case 'Grasshopper': return new HivePieceGrasshopper(owner);
                case 'Spider': return new HivePieceSpider(owner);
                default:
                    Utils.expectToBe(kind, 'SoldierAnt');
                    return new HivePieceSoldierAnt(owner);
            }
        }
    };

    protected constructor(public readonly owner: Player,
                          public readonly kind: HivePieceKind,
                          public readonly mustHaveFreedomToMove: boolean)
    {
    }

    public toString(): string {
        return `${this.kind}_${this.owner.toString()}`;
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
        super(owner, 'QueenBee', true);
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
                moves.push(HiveMoveCoordToCoord.from(coord, neighbor).get());
            }
        }
        return moves;
    }
}


export class HivePieceBeetle extends HivePiece {

    public constructor(owner: Player) {
        super(owner, 'Beetle', false);
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

export class HivePieceGrasshopper extends HivePiece {

    public constructor(owner: Player) {
        super(owner, 'Grasshopper', false);
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
                moves.push(HiveMoveCoordToCoord.from(coord, end).get());
            }
        }
        return moves;
    }
}


export class HivePieceSpider extends HivePiece {

    public constructor(owner: Player) {
        super(owner, 'Spider', true);
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

export class HivePieceSoldierAnt extends HivePiece {

    public constructor(owner: Player) {
        super(owner, 'SoldierAnt', true);
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

export class HivePieceStack implements ComparableObject {
    public static EMPTY: HivePieceStack = new HivePieceStack([]);

    public constructor(public readonly pieces: HivePiece[]) {
    }

    public equals(other: HivePieceStack): boolean {
        if (this.size() !== other.size()) return false;
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

    public size(): number {
        return this.pieces.length;
    }

    public containsPieceOf(player: Player) {
        for (const piece of this.pieces) {
            if (piece.owner === player) return true;
        }
        return false;
    }
}
