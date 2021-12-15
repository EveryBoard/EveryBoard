import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils, NumberTable } from 'src/app/utils/ArrayUtils';

const M: number = Number.MAX_SAFE_INTEGER;
const m: number = Number.MIN_SAFE_INTEGER;

export class MinimaxTestingState extends GameStateWithTable<number> {

    public static readonly BOARD_0: NumberTable = [ // first player wins, even with a minimax with depth = 1
        [6, 4, 3, 1],
        [4, 4, 3, 1],
        [3, 3, 2, 0],
        [1, 1, 0, 0],
    ];
    public static readonly BOARD_1: NumberTable = [ // first player wins, even with a minimax at depth = 1
        [+0, +M, -1, -1],
        [+1, +2, +M, -1],
        [+m, +3, +4, -1],
        [-1, +m, +m, -1],
    ];
    public static readonly BOARD_2: NumberTable = [
        [+0, +M, -1, -1],
        [+M, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ];
    public static readonly BOARD_3: NumberTable = [
        [+0, +1, +m, -1],
        [+1, +m, -1, -1],
        [+m, -1, -1, -1],
        [-1, -1, -1, -1],
    ];
    public static readonly BOARD_4: NumberTable = [
        [+0, +1, +m, -1],
        [+1, +m, -1, -1],
        [+m, -1, -1, -1],
        [-1, -1, -1, +1],
    ];
    public static initialBoard: NumberTable = MinimaxTestingState.BOARD_0;

    public constructor(readonly turn: number, readonly location: Coord) {
        super(ArrayUtils.copyBiArray(MinimaxTestingState.initialBoard), turn);
    }
    public static getInitialState(): MinimaxTestingState {
        return new MinimaxTestingState(0, new Coord(0, 0));
    }
}
