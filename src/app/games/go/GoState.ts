import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/utils';

type PieceType = 'alive' | 'dead' | 'territory' | 'empty';
export class GoPiece implements ComparableObject {

    public static BLACK: GoPiece = new GoPiece(Player.ZERO, 'alive');

    public static WHITE: GoPiece = new GoPiece(Player.ONE, 'alive');

    public static EMPTY: GoPiece = new GoPiece(Player.NONE, 'empty');

    public static DEAD_BLACK: GoPiece = new GoPiece(Player.ZERO, 'dead');

    public static DEAD_WHITE: GoPiece = new GoPiece(Player.ONE, 'dead');

    public static BLACK_TERRITORY: GoPiece = new GoPiece(Player.NONE, 'territory');

    public static WHITE_TERRITORY: GoPiece = new GoPiece(Player.NONE, 'territory');

    private constructor(readonly player: Player, readonly type: PieceType) {}

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
        assert(owner !== Player.NONE, 'Owner must be Player.ZERO or Player.ONE, got Player.NONE.');
        return owner === piece.player && piece.type !== 'territory';
    }
    public static ofPlayer(player: Player): GoPiece {
        if (player === Player.ZERO) return GoPiece.BLACK;
        else if (player === Player.ONE) return GoPiece.WHITE;
        else throw new Error('GoPiece.ofPlayer should only be called with Player.ZERO and Player.ONE.');
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
