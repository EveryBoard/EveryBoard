import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {Coord} from 'src/app/jscaip/Coord';

export enum Pawn {
    BLACK = 0, 
    WHITE,
    EMPTY,
    DEAD_BLACK,
    DEAD_WHITE
}

export enum Phase {
    PLAYING  = "G",
    PASSED   = "P",
    COUNTING = "C"
}

export class GoPartSlice extends GamePartSlice {

    protected readonly board: Pawn[][];

    private readonly koCoord: Coord;

    private readonly captured: number[];

    private readonly phase: Phase;

    public constructor(board: Pawn[][], captured: number[], turn: number, koCoord: Coord, phase: Phase) {
        super(board, turn);
        this.captured = captured;
        this.koCoord = koCoord;
        this.phase = phase;
    }

    public getKoCoordCopy(): Coord {
        return this.koCoord ? this.koCoord.getCopy() : null;
    }

    public getCapturedCopy(): number[] {
        return [this.captured[0], this.captured[1]];
    }

    public static getStartingBoard(): Pawn[][] {
        return GamePartSlice.createBiArray(GoPartSlice.WIDTH, GoPartSlice.HEIGHT, Pawn.EMPTY);
    }

    public static readonly WIDTH: number = 5;

    public static readonly HEIGHT: number = 5;
}