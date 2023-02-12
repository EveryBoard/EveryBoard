import { Coord } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Direction';
import { FreeHexagonalGameState } from 'src/app/jscaip/FreeHexagonalGameState';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexagonalUtils } from 'src/app/jscaip/HexagonalUtils';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPMap, ReversibleMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { HivePiece, HivePieceStack } from './HivePiece';

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
        for (const piece of this.pieces.listKeys()) {
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

export class HiveState extends FreeHexagonalGameState<HivePieceStack> implements ComparableObject {

    public readonly queenBees: MGPMap<Player, Coord>;

    public static getInitialState(): HiveState {
        const board: Table<HivePiece[]> = [];
        return HiveState.fromRepresentation(board, 0);
    }

    public static fromRepresentation(board: Table<HivePiece[]>, turn: number): HiveState {
        const pieces: ReversibleMap<Coord, HivePieceStack> = new ReversibleMap<Coord, HivePieceStack>();
        let remainingPieces: HiveRemainingPieces = HiveRemainingPieces.getInitial();
        const queenBees: MGPMap<Player, Coord> = new MGPMap();
        const height: number = board.length;
        for (let y: number = 0; y < height; y++) {
            const width: number = board[0].length;
            for (let x: number = 0; x < width; x++) {
                if (board[y][x].length > 0) {
                    pieces.set(new Coord(x, y), new HivePieceStack(board[y][x]));
                    const queenBee: MGPOptional<HivePiece> =
                        MGPOptional.ofNullable(board[y][x].find((piece: HivePiece) => piece.kind === 'QueenBee'));
                    if (queenBee.isPresent()) {
                        queenBees.set(queenBee.get().owner, new Coord(x, y));
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
                       queenBees: MGPMap<Player, Coord>,
                       turn: number,
                       offset?: Vector)
    {
        super(pieces, turn, offset);
        console.log('new state')
        console.log(this.offset)
        this.queenBees = queenBees.getCopy();
        for (const player of queenBees.listKeys()) {
            // If the offset computed by the parent's constructor is not (0, 0),
            // We will need to adapt the position of the queen bees.
            // The position of the pieces has already been adapted by the parent's constructor
            const oldCoord: Coord = queenBees.get(player).get();
            const newCoord: Coord = oldCoord.getNext(this.offset);
            this.queenBees.replace(player, newCoord);
        }
        this.queenBees.makeImmutable();
    }

    public equals(other: HiveState): boolean {
        return this.pieces.equals(other.pieces) &&
               this.remainingPieces.equals(other.remainingPieces) &&
               this.queenBees.equals(other.queenBees) &&
               this.turn === other.turn;
    }

    public increaseTurn(offset?: Vector): HiveState {
        return new HiveState(this.pieces, this.remainingPieces, this.queenBees, this.turn + 1, offset);
    }

    public getAt(coord: Coord): HivePieceStack {
        if (this.isOnBoard(coord)) {
            return this.pieces.get(coord).get();
        } else {
            return HivePieceStack.EMPTY;
        }
    }

    public isEmpty(stack: HivePieceStack): boolean {
        return stack.isEmpty();
    }

    public removeRemainingPiece(piece: HivePiece): HiveState {
        return new HiveState(this.pieces, this.remainingPieces.remove(piece), this.queenBees, this.turn);
    }

    public setAt(coord: Coord, stack: HivePieceStack): HiveState {
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
        return new HiveState(super.setPieceAt(coord, stack), this.remainingPieces, queenBees, this.turn);
    }

    public queenBeeLocation(player: Player): MGPOptional<Coord> {
        return this.queenBees.get(player);
    }

    public hasQueenBeeOnBoard(player: Player): boolean {
        return this.queenBeeLocation(player).isPresent();
    }

    public numberOfNeighbors(coord: Coord): number {
        let neighbors: number = 0;
        for (const direction of HexaDirection.factory.all) {
            const neighbor: Coord = coord.getNext(direction);
            if (this.getAt(neighbor).isEmpty() === false) {
                neighbors += 1;
            }
        }
        return neighbors;
    }

    public isDisconnected(): boolean {
        return this.getGroups().size() > 1;
    }

    public occupiedSpaces(): Coord[] {
        return this.pieces.listKeys();
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
}
