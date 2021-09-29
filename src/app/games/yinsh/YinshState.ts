import { YinshBoard } from 'src/app/games/yinsh/YinshBoard';
import { HexagonalGameState } from 'src/app/jscaip/HexagonalGameState';
import { YinshPiece } from './YinshPiece';

export class YinshState extends HexagonalGameState<YinshPiece, YinshBoard> {

    public static getInitialState(): YinshState {
        return new YinshState(YinshBoard.EMPTY, [5, 5], 0);
    }
    public constructor(board: YinshBoard,
                       public readonly sideRings: [number, number],
                       turn: number) {
        super(turn, board);
    }
    public isInitialPlacementPhase(): boolean {
        return this.turn < 10;
    }
    public equals(other: YinshState): boolean {
        if (this === other) return true;
        if (this.turn !== other.turn) return false;
        if (this.sideRings[0] !== other.sideRings[0]) return false;
        if (this.sideRings[1] !== other.sideRings[1]) return false;
        if (this.board.equals(other.board, (p1: YinshPiece, p2: YinshPiece) => p1 === p2) === false) {
            return false;
        }
        return true;
    }
}
