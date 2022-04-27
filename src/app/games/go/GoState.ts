import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/assert';

type PieceType = 'alive' | 'dead' | 'territory' | 'empty';
export class GoPiece implements ComparableObject {

    public static BLACK: GoPiece = new GoPiece(Player.ZERO, 'alive');

    public static WHITE: GoPiece = new GoPiece(Player.ONE, 'alive');

    public static EMPTY: GoPiece = new GoPiece(PlayerOrNone.NONE, 'empty');

    public static DEAD_BLACK: GoPiece = new GoPiece(Player.ZERO, 'dead');

    public static DEAD_WHITE: GoPiece = new GoPiece(Player.ONE, 'dead');

    public static BLACK_TERRITORY: GoPiece = new GoPiece(PlayerOrNone.NONE, 'territory');

    public static WHITE_TERRITORY: GoPiece = new GoPiece(PlayerOrNone.NONE, 'territory');

    private constructor(readonly player: PlayerOrNone, readonly type: PieceType) {}

    public equals(o: GoPiece): boolean {
        return o === this;
    }
    public toString(): string {
        switch (this) {
            case GoPiece.BLACK:
                return 'GoPiece.BLACK';
            case GoPiece.WHITE:
                return 'GoPiece.WHITE';
            case GoPiece.EMPTY:
                return 'GoPiece.EMPTY';
            case GoPiece.DEAD_BLACK:
                return 'GoPiece.DEAD_BLACK';
            case GoPiece.DEAD_WHITE:
                return 'GoPiece.DEAD_WHITE';
            case GoPiece.BLACK_TERRITORY:
                return 'GoPiece.BLACK_TERRITORY';
            default:
                assert(this === GoPiece.WHITE_TERRITORY, 'Unexisting GoPiece');
                return 'GoPiece.WHITE_TERRITORY';
        }
    }
    public static pieceBelongTo(piece: GoPiece, owner: Player): boolean {
        return owner === piece.player && piece.type !== 'territory';
    }
    public static ofPlayer(player: Player): GoPiece {
        if (player === Player.ZERO) return GoPiece.BLACK;
        else return GoPiece.WHITE;
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
    public getOwner(): PlayerOrNone {
        return this.player;
    }
    public nonTerritory(): GoPiece {
        assert(this.isEmpty(), 'Usually not false, if false, cover by test and return "this"');
        return GoPiece.EMPTY;
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
        this.captured = captured;
        this.koCoord = koCoord;
        this.phase = phase;
    }
    public static getInitialState(): GoState {
        const board: Table<GoPiece> = GoState.getStartingBoard();
        return new GoState(board, [0, 0], 0, MGPOptional.empty(), Phase.PLAYING);
    }
    public getCapturedCopy(): [number, number] {
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
