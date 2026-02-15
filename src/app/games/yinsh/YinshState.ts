import { Coord } from '../../jscaip/Coord';
import { Player } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { Table, TableUtils } from '../../jscaip/TableUtils';
import { HexagonalGameState } from '../../jscaip/state/HexagonalGameState';
import { YinshPiece } from './YinshPiece';

export class YinshState extends HexagonalGameState<YinshPiece> {

    public static SIZE: number = 11;

    public constructor(board: Table<YinshPiece>,
                       public readonly sideRings: PlayerNumberMap,
                       turn: number)
    {
        super(turn, board, YinshState.SIZE, YinshState.SIZE, [6, 4, 3, 2, 1], YinshPiece.EMPTY);
    }

    public isInitialPlacementPhase(): boolean {
        return this.turn < 10;
    }

    public countScores(): PlayerNumberMap {
        if (this.turn < 10) {
            return PlayerNumberMap.of(0, 0);
        } else {
            return this.sideRings;
        }
    }

    public equals(other: YinshState): boolean {
        if (this === other) {
            return true;
        }
        if (this.turn !== other.turn) {
            return false;
        }
        if (this.sideRings.equals(other.sideRings) === false) {
            return false;
        }
        return TableUtils.equals(this.board, other.board);
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

    public override isOnBoard(coord: Coord): boolean {
        if (coord.isNotInRange(this.width, this.height)) {
            return false;
        } else {
            return this.getUnsafe(coord) !== YinshPiece.UNREACHABLE;
        }
    }

    public override setAtUnsafe(coord: Coord, value: YinshPiece): this {
        const newBoard: YinshPiece[][] = TableUtils.copy(this.board);
        newBoard[coord.y][coord.x] = value;
        return new YinshState(newBoard, this.sideRings, this.turn) as this;
    }

}
