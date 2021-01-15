import { GamePartSlice } from '../../jscaip/GamePartSlice';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { ArrayUtils, NumberTable } from 'src/app/collectionlib/arrayutils/ArrayUtils';

export class GoPiece {
    public static BLACK: GoPiece = new GoPiece(Player.ZERO.value);

    public static WHITE: GoPiece = new GoPiece(Player.ONE.value);

    public static EMPTY: GoPiece = new GoPiece(Player.NONE.value);

    public static DEAD_BLACK: GoPiece = new GoPiece(3);

    public static DEAD_WHITE: GoPiece = new GoPiece(4);

    public static BLACK_TERRITORY: GoPiece = new GoPiece(5);

    public static WHITE_TERRITORY: GoPiece = new GoPiece(6);

    private constructor(readonly value: number) {}

    public static pieceBelongTo(piece: number, owner: Player): boolean {
        if (owner === Player.ZERO) {
            return piece === GoPiece.BLACK.value ||
                   piece === GoPiece.DEAD_BLACK.value;
        }
        if (owner === Player.ONE) {
            return piece === GoPiece.WHITE.value ||
                   piece === GoPiece.DEAD_WHITE.value;
        }
        throw new Error('Owner must be 0 or 1, got ' + owner);
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
        case 5:
            return GoPiece.BLACK_TERRITORY;
        case 6:
            return GoPiece.WHITE_TERRITORY;
        default:
            throw new Error('Unknwon GoPiece.value ' + value);
        }
    }
    public isOccupied(): boolean {
        return [GoPiece.BLACK, GoPiece.WHITE, GoPiece.DEAD_BLACK, GoPiece.DEAD_WHITE].includes(this);
    }
    public isEmpty(): boolean {
        return [GoPiece.BLACK_TERRITORY, GoPiece.WHITE_TERRITORY, GoPiece.EMPTY].includes(this);
    }
    public isDead(): boolean {
        return [GoPiece.DEAD_BLACK, GoPiece.DEAD_WHITE].includes(this);
    }
    public getAliveOpposite(): GoPiece {
        if (this === GoPiece.DEAD_BLACK) return GoPiece.WHITE;
        if (this === GoPiece.DEAD_WHITE) return GoPiece.BLACK;
        else throw new Error('Only dead piece have an alive opposite');
    }
    public nonTerritory(): GoPiece {
        if (this.isEmpty()) return GoPiece.EMPTY;
        else return this;
    }
}
export enum Phase {
    PLAYING = 'PLAYING',
    PASSED = 'PASSED',
    COUNTING = 'COUNTING',
    ACCEPT = 'ACCEPT',
    FINISHED = 'FINISHED'
}

export class GoPartSlice extends GamePartSlice {
    public static WIDTH = 9;

    public static HEIGHT = 9;

    public readonly koCoord: Coord | null; // TODO: MGPOptional this

    public readonly captured: ReadonlyArray<number>;

    public readonly phase: Phase;

    public static mapGoPieceBoard(board: GoPiece[][]): number[][] {
        return ArrayUtils.mapBiArray<GoPiece, number>(board, (goPiece: GoPiece) => goPiece.value);
    }
    public static mapNumberBoard(board: NumberTable): GoPiece[][] {
        return ArrayUtils.mapBiArray<number, GoPiece>(board, GoPiece.of);
    }
    public constructor(board: GoPiece[][], captured: number[], turn: number, koCoord: Coord, phase: Phase) {
        const intBoard: number[][] = GoPartSlice.mapGoPieceBoard(board);
        super(intBoard, turn);
        if (captured == null) throw new Error('Captured cannot be null');
        if (phase == null) throw new Error('Phase cannot be null');
        this.captured = captured;
        this.koCoord = koCoord;
        this.phase = phase;
    }
    public static getInitialSlice(): GoPartSlice {
        const board: GoPiece[][] = GoPartSlice.getStartingBoard();
        return new GoPartSlice(board, [0, 0], 0, null, Phase.PLAYING);
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
    public copy(): GoPartSlice {
        return new GoPartSlice(this.getCopiedBoardGoPiece(),
            this.getCapturedCopy(),
            this.turn,
            this.koCoord,
            this.phase);
    }
    public toString(): string {
        let result = '';
        for (const lines of this.board) {
            for (const piece of lines) {
                result += piece + ' ';
            }
            result += '\n';
        }
        return result;
    }
}
