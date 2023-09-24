import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils, Table } from 'src/app/utils/ArrayUtils';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert } from 'src/app/utils/assert';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { Utils } from 'src/app/utils/utils';
import { GoConfig } from './GoRules';
import { GobanGameComponent } from 'src/app/components/game-components/goban-game-component/GobanGameComponent';

type PieceType = 'alive' | 'dead' | 'territory' | 'empty';
export class GoPiece implements ComparableObject {

    public static DARK: GoPiece = new GoPiece(Player.ZERO, 'alive');

    public static LIGHT: GoPiece = new GoPiece(Player.ONE, 'alive');

    public static EMPTY: GoPiece = new GoPiece(PlayerOrNone.NONE, 'empty');

    public static DEAD_DARK: GoPiece = new GoPiece(Player.ZERO, 'dead');

    public static DEAD_LIGHT: GoPiece = new GoPiece(Player.ONE, 'dead');

    public static DARK_TERRITORY: GoPiece = new GoPiece(PlayerOrNone.NONE, 'territory');

    public static LIGHT_TERRITORY: GoPiece = new GoPiece(PlayerOrNone.NONE, 'territory');

    private constructor(readonly player: PlayerOrNone, readonly type: PieceType) {}

    public equals(other: GoPiece): boolean {
        return other === this;
    }
    public toString(): string {
        switch (this) {
            case GoPiece.DARK:
                return 'GoPiece.DARK';
            case GoPiece.LIGHT:
                return 'GoPiece.LIGHT';
            case GoPiece.EMPTY:
                return 'GoPiece.EMPTY';
            case GoPiece.DEAD_DARK:
                return 'GoPiece.DEAD_DARK';
            case GoPiece.DEAD_LIGHT:
                return 'GoPiece.DEAD_LIGHT';
            case GoPiece.DARK_TERRITORY:
                return 'GoPiece.DARK_TERRITORY';
            default:
                assert(this === GoPiece.LIGHT_TERRITORY, 'Unexisting GoPiece');
                return 'GoPiece.LIGHT_TERRITORY';
        }
    }
    public static pieceBelongTo(piece: GoPiece, owner: Player): boolean {
        return owner === piece.player && piece.type !== 'territory';
    }
    public static ofPlayer(player: Player): GoPiece {
        if (player === Player.ZERO) return GoPiece.DARK;
        else return GoPiece.LIGHT;
    }
    public isOccupied(): boolean {
        return [GoPiece.DARK, GoPiece.LIGHT, GoPiece.DEAD_DARK, GoPiece.DEAD_LIGHT].includes(this);
    }
    public isEmpty(): boolean {
        return [GoPiece.DARK_TERRITORY, GoPiece.LIGHT_TERRITORY, GoPiece.EMPTY].includes(this);
    }
    public isDead(): boolean {
        return [GoPiece.DEAD_DARK, GoPiece.DEAD_LIGHT].includes(this);
    }
    public isTerritory(): boolean {
        return [GoPiece.DARK_TERRITORY, GoPiece.LIGHT_TERRITORY].includes(this);
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
    public static getInitialState(config: GoConfig): GoState {
        const board: GoPiece[][] = GoState.getStartingBoard(config);
        let turn: number = 0;
        const left: number = GobanGameComponent.getHorizontalLeft(config.width);
        const right: number = GobanGameComponent.getHorizontalRight(config.width);
        const up: number = GobanGameComponent.getVerticalUp(config.height);
        const down: number = GobanGameComponent.getVerticalDown(config.height);
        const horizontalCenter: number = GobanGameComponent.getHorizontalCenter(config.width);
        const verticalCenter: number = GobanGameComponent.getVerticalCenter(config.height);
        if (0 < config.handicap) {
            turn++; // Dark has handicap, so Light begins
            board[up][left] = GoPiece.DARK;
        }
        if (1 < config.handicap) {
            board[down][right] = GoPiece.DARK;
        }
        if (2 < config.handicap) {
            board[up][right] = GoPiece.DARK;
        }
        if (3 < config.handicap) {
            board[down][left] = GoPiece.DARK;
        }
        if (4 < config.handicap) {
            board[verticalCenter][horizontalCenter] = GoPiece.DARK;
        }
        if (5 < config.handicap) {
            board[up][horizontalCenter] = GoPiece.DARK;
        }
        if (6 < config.handicap) {
            board[down][horizontalCenter] = GoPiece.DARK;
        }
        if (7 < config.handicap) {
            board[verticalCenter][left] = GoPiece.DARK;
        }
        if (8 < config.handicap) {
            board[verticalCenter][right] = GoPiece.DARK;
        }
        return new GoState(board, [0, 0], turn, MGPOptional.empty(), Phase.PLAYING);
    }
    public getCapturedCopy(): [number, number] {
        return [this.captured[0], this.captured[1]];
    }
    public static getStartingBoard(config: RulesConfig): GoPiece[][] {
        // eslint-disable-next-line dot-notation
        const width: number = Utils.getNonNullable(config['width']) as number;
        // eslint-disable-next-line dot-notation
        const height: number = Utils.getNonNullable(config['height']) as number;
        return ArrayUtils.createTable(width, height, GoPiece.EMPTY);
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
