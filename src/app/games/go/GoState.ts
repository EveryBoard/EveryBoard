import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/utils';

type PieceType = 'alive' | 'dead' | 'territory' | 'empty';
export class GoPiece {
    public static BLACK: GoPiece = new GoPiece(Player.ZERO.value, Player.ZERO, 'alive');

    public static WHITE: GoPiece = new GoPiece(Player.ONE.value, Player.ONE, 'alive');

    public static EMPTY: GoPiece = new GoPiece(Player.NONE.value, Player.NONE, 'empty');

    public static DEAD_BLACK: GoPiece = new GoPiece(3, Player.ZERO, 'dead');

    public static DEAD_WHITE: GoPiece = new GoPiece(4, Player.ONE, 'dead');

    public static BLACK_TERRITORY: GoPiece = new GoPiece(5, Player.NONE, 'territory');

    public static WHITE_TERRITORY: GoPiece = new GoPiece(6, Player.NONE, 'territory');

    private constructor(readonly value: number, readonly player: Player, readonly type: PieceType) {}

    public static pieceBelongTo(piece: GoPiece, owner: Player): boolean {
        assert(owner !== Player.NONE, 'Owner must be Player.ZERO or Player.ONE, got Player.NONE.');
        return owner === piece.player && piece.type !== 'territory';
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
                throw new Error('Invalid value for GoPiece: ' + value + '.');
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
    public isTerritory(): boolean {
        return [GoPiece.BLACK_TERRITORY, GoPiece.WHITE_TERRITORY].includes(this);
    }
    public getOwner(): Player {
        return this.player;
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
export class GoState extends GameStateWithTable<GoPiece> {

    public static WIDTH: number = 13;

    public static HEIGHT: number = 13;

    public readonly koCoord: MGPOptional<Coord>;

    public readonly captured: ReadonlyArray<number>;

    public readonly phase: Phase;

    public constructor(board: Table<GoPiece>,
                       captured: number[],
                       turn: number,
                       koCoord: MGPOptional<Coord>,
                       phase: Phase)
    {
        super(board, turn);
        if (captured == null) throw new Error('Captured cannot be null.');
        if (koCoord == null) throw new Error('Ko Coord cannot be null, use MGPOptional.empty() instead.');
        if (phase == null) throw new Error('Phase cannot be null.');
        this.captured = captured;
        this.koCoord = koCoord;
        this.phase = phase;
    }
    public static getInitialState(): GoState {
        const board: Table<GoPiece> = GoState.getStartingBoard();
        return new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PLAYING);
    }
    public getCapturedCopy(): number[] {
        return [this.captured[0], this.captured[1]];
    }
    public static getStartingBoard(): Table<GoPiece> {
        return ArrayUtils.createTable(GoState.WIDTH, GoState.HEIGHT, GoPiece.EMPTY);
    }
    public copy(): GoState {
        return new GoState(this.getCopiedBoard(),
                           this.getCapturedCopy(),
                           this.turn,
                           this.koCoord,
                           this.phase);
    }
    public isDead(coord: Coord): boolean {
        return this.getPieceAt(coord).isDead();
    }
    public isTerritory(coord: Coord): boolean {
        return this.getPieceAt(coord).isTerritory();
    }
}
