import { GamePartSlice } from "src/app/jscaip/GamePartSlice";
import { Coord } from "src/app/jscaip/Coord";

export class MinimaxTestingPartSlice extends GamePartSlice {

    static initialBoard: number[][];

    public readonly location: Coord;

    public constructor(turn: number, location: Coord) {
        super(MinimaxTestingPartSlice.initialBoard, turn);
        if (location == null) throw new Error("location cannot be null");
        this.location = location;
    }

    static BOARD_0: number[][] = [ // le premier joueur gagne, même minimax avec depth=1
        [ 7, 4, 3, 1],
        [ 4, 4, 3, 1],
        [ 3, 3, 2, 0],
        [ 1, 1, 0, 0]
    ];

    static BOARD_1: number[][] = [ // le premier joueur gagne, même minimax avec depth=1
        [                       0, Number.MAX_SAFE_INTEGER,                      -1, -1],
        [                       1,                       2, Number.MAX_SAFE_INTEGER, -1],
        [ Number.MIN_SAFE_INTEGER,                       3,                       4, -1],
        [                      -1, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -1]
    ];

    static getStartingSlice(): MinimaxTestingPartSlice {
        return new MinimaxTestingPartSlice(0, new Coord(0, 0));
    }
}