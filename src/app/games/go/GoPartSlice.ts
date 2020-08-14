import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {Coord} from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/collectionlib/arrayutils/ArrayUtils';

export class GoPiece {

    public static BLACK: GoPiece = new GoPiece(Player.ZERO.value);

    public static WHITE: GoPiece = new GoPiece(Player.ONE.value);

    public static EMPTY: GoPiece = new GoPiece(Player.NONE.value);

    public static DEAD_BLACK: GoPiece = new GoPiece(3);

    public static DEAD_WHITE: GoPiece = new GoPiece(4);

    private constructor(readonly value: number) {}

    public static pieceBelongTo(piece: number, owner: Player): boolean {
        if (owner === Player.ZERO) {
            return piece === GoPiece.BLACK.value || // TODO: GoPiece-ify
                   piece === GoPiece.DEAD_BLACK.value;// TODO: GoPiece-ify
        }
        if (owner === Player.ONE) {
            return piece === GoPiece.WHITE.value ||// TODO: GoPiece-ify
                   piece === GoPiece.DEAD_WHITE.value;// TODO: GoPiece-ify
        }
        throw new Error("Owner must be 0 or 1, got " + owner);
    }
    public static of(value: number): GoPiece {
        switch (value) {
            case Player.ZERO.value:
                return GoPiece.BLACK;
            case Player.ONE.value:
                return GoPiece.WHITE;
            case Player.NONE.value:
                return GoPiece.EMPTY;
            case 3:
                return GoPiece.DEAD_BLACK;
            case 4:
                return GoPiece.DEAD_WHITE;
            default:
                throw new Error("Unknwon GoPiece.value " + value);
        }
    }
}
export enum Phase {
    PLAYING  = "PLAYING",
    PASSED   = "PASSED",
    COUNTING = "COUNTING",
    ACCEPT   = "ACCEPT",
    FINISHED = "FINISHED"
}

export class GoPartSlice extends GamePartSlice {

    public readonly koCoord: Coord | null; // TODO: MGPOptional this

    public readonly captured: ReadonlyArray<number>;

    public readonly phase: Phase;

    public static mapGoPieceBoard(board: GoPiece[][]): number[][] {
        return ArrayUtils.mapBiArray<GoPiece, number>(board, (goPiece: GoPiece) => goPiece.value);
    }
    public static mapNumberBoard(board: ReadonlyArray<ReadonlyArray<number>>): GoPiece[][] {
        return ArrayUtils.mapBiArray<number, GoPiece>(board, GoPiece.of);
    }
    public constructor(board: GoPiece[][], captured: number[], turn: number, koCoord: Coord, phase: Phase) {
        const intBoard: number[][] = GoPartSlice.mapGoPieceBoard(board);
        super(intBoard, turn);
        if (captured == null) throw new Error("Captured cannot be null");
        if (phase == null) throw new Error("Phase cannot be null");
        this.captured = captured;
        this.koCoord = koCoord;
        this.phase = phase;
    }
    public getCapturedCopy(): number[] {
        return [this.captured[0], this.captured[1]];
    }
    public static getStartingBoard(): GoPiece[][] {
        return ArrayUtils.createBiArray(GoPartSlice.WIDTH, GoPartSlice.HEIGHT, GoPiece.EMPTY);
    }
    public getBoardByXYGoPiece(x: number, y: number): GoPiece {
        const intValue: number = this.getBoardByXY(x, y);
        return GoPiece.of(intValue);
    }
    public getBoardAtGoPiece(coord: Coord): GoPiece {
        return this.getBoardByXYGoPiece(coord.x, coord.y);
    }
    public getCopiedBoardGoPiece(): GoPiece[][] {
        return GoPartSlice.mapNumberBoard(this.board);
    }
    public static readonly WIDTH: number = 5;

    public static readonly HEIGHT: number = 5;
}