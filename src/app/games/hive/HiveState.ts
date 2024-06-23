import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Vector';
import { OpenHexagonalGameState } from 'src/app/jscaip/state/OpenHexagonalGameState';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { ComparableObject, MGPMap, MGPOptional, ReversibleMap, Utils } from '@everyboard/lib';
import { HivePiece, HivePieceStack } from './HivePiece';
import { HexagonalUtils } from 'src/app/jscaip/HexagonalUtils';
import { CoordSet } from 'src/app/jscaip/CoordSet';

export class HiveRemainingPieces implements ComparableObject {

    public static getInitial(): HiveRemainingPieces {
        const pieces: MGPMap<HivePiece, number> = new MGPMap();
        for (const player of Player.PLAYERS) {
            pieces.set(new HivePiece(player, 'QueenBee'), 1);
            pieces.set(new HivePiece(player, 'Beetle'), 2);
            pieces.set(new HivePiece(player, 'Spider'), 2);
            pieces.set(new HivePiece(player, 'Grasshopper'), 3);
            pieces.set(new HivePiece(player, 'SoldierAnt'), 3);
        }
        pieces.makeImmutable();
        return new HiveRemainingPieces(pieces);
    }
    private constructor(public readonly pieces: MGPMap<HivePiece, number>) {
    }
    public equals(other: HiveRemainingPieces): boolean {
        return this.pieces.equals(other.pieces);
    }
    public getQuantity(piece: HivePiece): number {
        return this.pieces.get(piece).get();
    }
    public hasRemaining(piece: HivePiece): boolean {
        return this.getQuantity(piece) > 0;
    }
    public getAny(player: Player): MGPOptional<HivePiece> {
        for (const piece of this.pieces.getKeyList()) {
            if (piece.owner === player && this.hasRemaining(piece)) {
                return MGPOptional.of(piece);
            }
        }
        return MGPOptional.empty();
    }
    public remove(piece: HivePiece): HiveRemainingPieces {
        const remaining: number = this.pieces.get(piece).get();
        Utils.assert(remaining > 0, 'HiveRemainingPieces cannot remove a non-remainingPiece');
        const newPieces: MGPMap<HivePiece, number> = this.pieces.getCopy();
        newPieces.replace(piece, remaining-1);
        return new HiveRemainingPieces(newPieces);
    }
    public toListOfStacks(): HivePieceStack[] {
        const remaining: HivePieceStack[] = [];
        this.pieces.forEach((piece: {key: HivePiece, value: number}) => {
            const pieces: HivePiece[] = [];
            for (let i: number = 0; i < piece.value; i++) {
                pieces.push(piece.key);
            }
            remaining.push(new HivePieceStack(pieces));
        });
        return remaining;
    }
    public getPlayerPieces(player: Player): HivePiece[] {
        const remaining: HivePiece[] = [];
        this.pieces.forEach((item: {key: HivePiece, value: number}) => {
            if (item.key.owner === player && item.value > 0) remaining.push(item.key);
        });
        return remaining;
    }
}

/* Like HiveState, but does not recompute the offset between changes.
 * Can only be used while making temporary changes to the state.
 * Has to be converted to a regular HiveState after all changes have been made.
 */
class HiveStateUpdate {

    public static of(state: HiveState): HiveStateUpdate {
        return new HiveStateUpdate(state.pieces, state.remainingPieces, state.queenBees, state.turn);
    }
    private constructor(public readonly pieces: ReversibleMap<Coord, HivePieceStack>,
                        public readonly remainingPieces: HiveRemainingPieces,
                        public readonly queenBees: MGPMap<Player, Coord>,
                        public readonly turn: number) {}

    public setAt(coord: Coord, stack: HivePieceStack): HiveStateUpdate {
        const queenBees: MGPMap<Player, Coord> = this.queenBees.getCopy();
        for (const player of Player.PLAYERS) {
            // If there was a queen bee here, we remove it from the cache
            if (queenBees.get(player).equalsValue(coord)) {
                queenBees.delete(player);
            }
        }
        for (const piece of stack.pieces) {
            // Add any queen added here to the cache
            if (piece.kind === 'QueenBee') {
                queenBees.put(piece.owner, coord);
            }
        }
        const pieces: ReversibleMap<Coord, HivePieceStack> = this.pieces.getCopy();
        if (stack.isEmpty()) {
            pieces.delete(coord);
        } else {
            pieces.put(coord, stack);
        }
        return new HiveStateUpdate(pieces, this.remainingPieces, queenBees, this.turn);
    }
    public removeRemainingPiece(piece: HivePiece): HiveStateUpdate {
        return new HiveStateUpdate(this.pieces, this.remainingPieces.remove(piece), this.queenBees, this.turn);
    }
    public increaseTurnAndFinalizeUpdate(): HiveState {
        return new HiveState(this.pieces, this.remainingPieces, this.queenBees, this.turn + 1);
    }
}

export class HiveState extends OpenHexagonalGameState<HivePieceStack> implements ComparableObject {

    public static fromRepresentation(board: Table<HivePiece[]>, turn: number, vector: Vector = new Vector(0, 0))
    : HiveState
    {
        const pieces: ReversibleMap<Coord, HivePieceStack> = new ReversibleMap<Coord, HivePieceStack>();
        let remainingPieces: HiveRemainingPieces = HiveRemainingPieces.getInitial();
        const queenBees: MGPMap<Player, Coord> = new MGPMap();
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (board[y][x].length > 0) {
                    const adaptedCoord: Coord = new Coord(x, y).getNext(vector, 1);
                    pieces.set(adaptedCoord, new HivePieceStack(board[y][x]));
                    const queenBee: MGPOptional<HivePiece> =
                        MGPOptional.ofNullable(board[y][x].find((piece: HivePiece) => piece.kind === 'QueenBee'));
                    if (queenBee.isPresent()) {
                        queenBees.set(queenBee.get().owner, adaptedCoord);
                    }
                    for (const piece of board[y][x]) {
                        remainingPieces = remainingPieces.remove(piece);
                    }
                }
            }
        }
        return new HiveState(pieces, remainingPieces, queenBees, turn);
    }

    public constructor(pieces: ReversibleMap<Coord, HivePieceStack>,
                       public readonly remainingPieces: HiveRemainingPieces,
                       public readonly queenBees: MGPMap<Player, Coord>,
                       turn: number)
    {
        super(pieces, turn);
        this.queenBees = queenBees.getCopy();
        for (const player of queenBees.getKeyList()) {
            // If the offset computed by the parent's constructor is not (0, 0),
            // We will need to adapt the position of the queen bees.
            // The position of the pieces has already been adapted by the parent's constructor
            const oldCoord: Coord = queenBees.get(player).get();
            this.queenBees.replace(player, oldCoord);
        }
        this.queenBees.makeImmutable();
    }

    public update(): HiveStateUpdate {
        return HiveStateUpdate.of(this);
    }

    public equals(other: HiveState): boolean {
        return this.pieces.equals(other.pieces) &&
               this.remainingPieces.equals(other.remainingPieces) &&
               this.queenBees.equals(other.queenBees) &&
               this.turn === other.turn;
    }

    public getAt(coord: Coord): HivePieceStack {
        if (this.isOnBoard(coord)) {
            return this.pieces.get(coord).get();
        } else {
            return HivePieceStack.EMPTY;
        }
    }

    public queenBeeLocation(player: Player): MGPOptional<Coord> {
        return this.queenBees.get(player);
    }

    public hasQueenBeeOnBoard(player: Player): boolean {
        return this.queenBeeLocation(player).isPresent();
    }

    public numberOfNeighbors(coord: Coord): number {
        let neighbors: number = 0;
        for (const neighbor of HexagonalUtils.getNeighbors(coord)) {
            if (this.getAt(neighbor).hasPieces()) {
                neighbors += 1;
            }
        }
        return neighbors;
    }

    public isDisconnected(): boolean {
        return this.getGroups().size() > 1;
    }

    public occupiedSpaces(): Coord[] {
        return this.pieces.getKeyList();
    }

    public emptyNeighbors(coord: Coord): Coord[] {
        const result: Coord[] = [];
        for (const neighbor of HexagonalUtils.getNeighbors(coord)) {
            if (this.getAt(neighbor).isEmpty()) {
                result.push(neighbor);
            }
        }
        return result;
    }

    public haveCommonNeighbor(first: Coord, second: Coord): boolean {
        const occupiedNeighborsOfFirst: CoordSet = this.getOccupiedNeighbors(first);
        const occupiedNeighborsOfSecond: CoordSet = this.getOccupiedNeighbors(second);
        const commonNeighbor: MGPOptional<Coord> =
            occupiedNeighborsOfFirst.findAnyCommonElement(occupiedNeighborsOfSecond);
        return commonNeighbor.isPresent();
    }
}
