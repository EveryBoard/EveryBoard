import { Coord } from 'src/app/jscaip/Coord';
import { HexagonalGameState } from 'src/app/jscaip/HexagonalGameState';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { YinshPiece } from './YinshPiece';

export class YinshState extends HexagonalGameState<YinshPiece> {

    public static SIZE: number = 11;

    public static getInitialState(): YinshState {
        const _: YinshPiece = YinshPiece.EMPTY;
        const N: YinshPiece = YinshPiece.UNREACHABLE;
        const board: Table<YinshPiece> = [
            [N, N, N, N, N, N, _, _, _, _, N],
            [N, N, N, N, _, _, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, _, _, N, N],
            [_, _, _, _, _, _, _, _, N, N, N],
            [_, _, _, _, _, _, _, N, N, N, N],
            [N, _, _, _, _, N, N, N, N, N, N],
        ];
        return new YinshState(board, [5, 5], 0);
    }
    public constructor(board: Table<YinshPiece>,
                       public readonly sideRings: [number, number],
                       turn: number)
    {
        super(turn, board, YinshState.SIZE, YinshState.SIZE, [6, 4, 3, 2, 1], YinshPiece.EMPTY);
    }
    public isInitialPlacementPhase(): boolean {
        return this.turn < 10;
    }
    public countScores(): [number, number] {
        if (this.turn < 10) {
            return [0, 0];
        } else {
            return this.sideRings;
        }
    }
    public equals(other: YinshState): boolean {
        if (this === other) return true;
        if (this.turn !== other.turn) return false;
        if (this.sideRings[0] !== other.sideRings[0]) return false;
        if (this.sideRings[1] !== other.sideRings[1]) return false;
        return ArrayUtils.compareTable(this.board, other.board);
    }
    public getRingCoords(player: Player): Coord[] {
        const rings: Coord[] = [];
        this.forEachCoord((coord: Coord, content: YinshPiece): void => {
            if (content.isRing && content.player === player) {
                rings.push(coord);
            }
        });
        return rings;
    }
    public isOnBoard(coord: Coord): boolean {
        if (coord.isNotInRange(this.width, this.height)) {
            return false;
        }
        return this.board[coord.y][coord.x] !== YinshPiece.UNREACHABLE;
    }
    public setAtUnsafe(coord: Coord, value: YinshPiece): this {
        const newBoard: YinshPiece[][] = ArrayUtils.copyBiArray(this.board);
        newBoard[coord.y][coord.x] = value;
        return new YinshState(newBoard, this.sideRings, this.turn) as this;
    }
}
