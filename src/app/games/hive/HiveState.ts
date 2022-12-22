import { Coord } from 'src/app/jscaip/Coord';
import { FreeHexagonalGameState } from 'src/app/jscaip/FreeHexagonalGameState';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexagonalUtils } from 'src/app/jscaip/HexagonalUtils';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPMap, ReversibleMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { HivePiece, HivePieceBeetle, HivePieceGrasshopper, HivePieceQueenBee, HivePieceSoldierAnt, HivePieceSpider, HivePieceStack } from './HivePiece';

export class HiveRemainingPieces implements ComparableObject {

    public static getInitial(): HiveRemainingPieces {
        const pieces: MGPMap<HivePiece, number> = new MGPMap();
        for (const player of Player.PLAYERS) {
            pieces.set(new HivePieceQueenBee(player), 1);
            pieces.set(new HivePieceBeetle(player), 2);
            pieces.set(new HivePieceSpider(player), 2);
            pieces.set(new HivePieceGrasshopper(player), 3);
            pieces.set(new HivePieceSoldierAnt(player), 3);
        }
        return new HiveRemainingPieces(pieces);
    }

    public constructor(private readonly pieces: MGPMap<HivePiece, number>) {
    }

    public equals(other: HiveRemainingPieces): boolean {
        return this.pieces.equals(other.pieces);
    }

    public getCopy(): HiveRemainingPieces {
        return new HiveRemainingPieces(this.pieces.getCopy());
    }

    public hasRemaining(piece: HivePiece): boolean {
        return this.pieces.get(piece).get() > 0;
    }

    public hasRemainingPieces(player: Player): boolean {
        return this.getAnyRemainingPiece(player).isPresent();
    }

    public getAnyRemainingPiece(player: Player): MGPOptional<HivePiece> {
        for (const piece of this.pieces.listKeys()) {
            if (piece.owner === player && this.hasRemaining(piece)) {
                return MGPOptional.of(piece);
            }
        }
        return MGPOptional.empty();
    }

    public remove(piece: HivePiece): void {
        const remaining: number = this.pieces.get(piece).get();
        Utils.assert(remaining > 0, 'HiveRemainingPieces cannot remove a non-remainingPiece');
        this.pieces.replace(piece, remaining-1);
    }

    public toList(): [HivePiece, number][] {
        const remaining: [HivePiece, number][] = [];
        this.pieces.forEach((item: {key: HivePiece, value: number}) => {
            remaining.push([item.key, item.value]);
        });
        return remaining;

    }
}

export class HiveState extends FreeHexagonalGameState<HivePieceStack> implements ComparableObject {

    public readonly width: number;

    public readonly height: number;

    public static getInitialState(): HiveState {
        const board: Table<HivePiece[]> = [];
        return HiveState.fromRepresentation(board, 0);
    }

    public static fromRepresentation(board: Table<HivePiece[]>, turn: number): HiveState {
        const pieces: ReversibleMap<Coord, HivePieceStack> = new ReversibleMap<Coord, HivePieceStack>();
        const remainingPieces: HiveRemainingPieces = HiveRemainingPieces.getInitial();
        const queenBees: MGPMap<Player, Coord> = new MGPMap();
        for (let y: number = 0; y < board.length; y++) {
            for (let x: number = 0; x < board[0].length; x++) {
                if (board[y][x].length > 0) {
                    pieces.set(new Coord(x, y), new HivePieceStack(board[y][x]));
                    const queenBee: MGPOptional<HivePiece> =
                        MGPOptional.ofNullable(board[y][x].find((piece: HivePiece) =>
                            piece instanceof HivePieceQueenBee));
                    if (queenBee.isPresent()) {
                        queenBees.set(queenBee.get().owner, new Coord(x, y));
                    }
                    for (const piece of board[y][x]) {
                        console.log('removing ' + piece.toString());
                        remainingPieces.remove(piece);
                    }
                }
            }
        }
        return new HiveState(pieces, remainingPieces, queenBees, turn);
    }

    public constructor(pieces: ReversibleMap<Coord, HivePieceStack>,
                       public readonly remainingPieces: HiveRemainingPieces,
                       private readonly queenBees: MGPMap<Player, Coord>,
                       turn: number)
    {
        super(pieces, turn);
    }

    public equals(other: HiveState): boolean {
        return this.pieces.equals(other.pieces) &&
            this.remainingPieces.equals(other.remainingPieces) &&
            this.queenBees.equals(other.queenBees) &&
            this.turn === other.turn;
    }

    public getCopy(): HiveState {
        return new HiveState(this.pieces.getCopy(),
                             this.remainingPieces.getCopy(),
                             this.queenBees.getCopy(),
                             this.turn);
    }

    public increaseTurnAndRecomputeBounds(): HiveState {
        return new HiveState(this.pieces.getCopy(),
                             this.remainingPieces.getCopy(),
                             this.queenBees.getCopy(),
                             this.turn+1);
    }

    public getAt(coord: Coord): HivePieceStack {
        if (this.isOnBoard(coord)) {
            return this.pieces.get(coord).get();
        } else {
            return HivePieceStack.EMPTY;
        }
    }

    public isEmpty(pieces: HivePieceStack): boolean {
        return pieces.isEmpty();
    }

    public override setAt(coord: Coord, pieces: HivePieceStack): void {
        for (const player of Player.PLAYERS) {
            // If there was a queen bee here, we remove it from the cache
            if (this.queenBees.get(player).equalsValue(coord)) {
                this.queenBees.delete(player);
            }
        }
        for (const piece of pieces.pieces) {
            // Add any queen added here to the cache
            if (piece instanceof HivePieceQueenBee) {
                this.queenBees.put(piece.owner, coord);
            }
        }

        super.setAt(coord, pieces);
    }

    public queenBeeLocation(player: Player): MGPOptional<Coord> {
        return this.queenBees.get(player);
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
        for (const neighbor of HexagonalUtils.neighbors(coord)) {
            if (this.getAt(neighbor).isEmpty()) {
                result.push(neighbor);
            }
        }
        return result;
    }

}
