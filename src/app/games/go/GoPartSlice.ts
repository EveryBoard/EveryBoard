import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {Coord} from 'src/app/jscaip/Coord';

export enum Pawn { // TODO: delete class, replace by GoPiece
    BLACK = 0,
    WHITE,
    EMPTY,
    DEAD_BLACK,
    DEAD_WHITE
}
export class GoPiece {

    public static pieceBelongTo(piece: Pawn, owner: number): boolean {
        if (owner === 0) {
            return piece === Pawn.BLACK ||
                   piece === Pawn.DEAD_BLACK;
        }
        if (owner === 1) {
            return piece === Pawn.BLACK ||
                   piece === Pawn.DEAD_BLACK;
        }
        throw new Error("Owner must be 0 or 1, got " + owner);
    }
}
export enum Phase {
    PLAYING  = "G",
    PASSED   = "P",
    COUNTING = "C"
}

export class GoPartSlice extends GamePartSlice {

    public readonly koCoord: Coord | null;

    public readonly captured: ReadonlyArray<number>;

    public readonly phase: Phase;

    public constructor(board: Pawn[][], captured: number[], turn: number, koCoord: Coord, phase: Phase) {
        super(board, turn);
        if (captured == null) throw new Error("Captured cannot be null");
        if (phase == null) throw new Error("Phase cannot be null");
        this.captured = captured;
        this.koCoord = koCoord;
        this.phase = phase;
    }
    public getCapturedCopy(): number[] {
        return [this.captured[0], this.captured[1]];
    }
    public static getStartingBoard(): Pawn[][] {
        return GamePartSlice.createBiArray(GoPartSlice.WIDTH, GoPartSlice.HEIGHT, Pawn.EMPTY);
    }
    public getCopiedBoard(): Pawn[][] {
        return GamePartSlice.copyBiArray(this.board);
    }
    public static readonly WIDTH: number = 5;

    public static readonly HEIGHT: number = 5;
}