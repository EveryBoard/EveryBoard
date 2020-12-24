import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { Coord } from "src/app/jscaip/coord/Coord";
import { ArrayUtils, NumberTable } from "src/app/collectionlib/arrayutils/ArrayUtils";

export class MinimaxTestingPartSlice extends GamePartSlice {

    public static readonly BOARD_0: NumberTable = [ // le premier joueur gagne, même minimax avec depth=1
        [ 6, 4, 3, 1],
        [ 4, 4, 3, 1],
        [ 3, 3, 2, 0],
        [ 1, 1, 0, 0]
    ];
    public static readonly BOARD_1: NumberTable = [ // le premier joueur gagne, même minimax avec depth=1
        [                       0, Number.MAX_SAFE_INTEGER,                      -1, -1],
        [                       1,                       2, Number.MAX_SAFE_INTEGER, -1],
        [ Number.MIN_SAFE_INTEGER,                       3,                       4, -1],
        [                      -1, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -1]
    ];
    public static initialBoard: NumberTable = MinimaxTestingPartSlice.BOARD_0;;

    public constructor(readonly turn: number, readonly location: Coord) {
        super(ArrayUtils.copyBiArray(MinimaxTestingPartSlice.initialBoard), turn);
        if (location == null) throw new Error("location cannot be null");
    }
    public static getInitialSlice(): MinimaxTestingPartSlice {
        return new MinimaxTestingPartSlice(0, new Coord(0, 0));
    }
}