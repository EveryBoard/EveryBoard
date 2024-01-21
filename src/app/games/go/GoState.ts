import { Coord } from 'src/app/jscaip/Coord';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Table, TableUtils } from 'src/app/utils/ArrayUtils';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GoConfig } from './GoRules';
import { Utils } from 'src/app/utils/utils';

type PieceType = 'alive' | 'dead' | 'territory' | 'empty';

export class GoPiece implements ComparableObject {

    public static DARK: GoPiece = new GoPiece(Player.ZERO, 'alive');

    public static LIGHT: GoPiece = new GoPiece(Player.ONE, 'alive');

    public static EMPTY: GoPiece = new GoPiece(PlayerOrNone.NONE, 'empty');

    public static DEAD_DARK: GoPiece = new GoPiece(Player.ZERO, 'dead');

    public static DEAD_LIGHT: GoPiece = new GoPiece(Player.ONE, 'dead');

    public static DARK_TERRITORY: GoPiece = new GoPiece(Player.ZERO, 'territory');

    public static LIGHT_TERRITORY: GoPiece = new GoPiece(Player.ONE, 'territory');

    private constructor(readonly player: PlayerOrNone, public readonly type: PieceType) {}

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
                Utils.assert(this === GoPiece.LIGHT_TERRITORY, 'Unexisting GoPiece');
                return 'GoPiece.LIGHT_TERRITORY';
        }
    }

    public static pieceBelongTo(piece: GoPiece, owner: Player): boolean {
        return owner === piece.player && piece.type !== 'territory';
    }

    public static ofPlayer(player: Player): GoPiece {
        if (player === Player.ZERO) {
            return GoPiece.DARK;
        } else {
            return GoPiece.LIGHT;
        }
    }

    public static territoryOf(player: Player): GoPiece {
        if (player === Player.ZERO) {
            return GoPiece.DARK_TERRITORY;
        } else {
            return GoPiece.LIGHT_TERRITORY;
        }
    }

    public isOccupied(): boolean {
        return this.type === 'alive' ||
               this.type === 'dead';
    }

    public isEmpty(): boolean {
        return this.type === 'territory' ||
               this.type === 'empty';
    }

    public isAlive(): boolean {
        return this.type === 'alive';
    }

    public isDead(): boolean {
        return this.type === 'dead';
    }

    public isTerritory(): boolean {
        return this.type === 'territory';
    }

    public getOwner(): PlayerOrNone {
        return this.player;
    }

    public nonTerritory(): GoPiece {
        Utils.assert(this.isEmpty(), 'Usually not false, if false, cover by test and return "this"');
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

    public readonly captured: PlayerNumberMap;

    public readonly phase: Phase;

    public constructor(board: Table<GoPiece>,
                       captured: PlayerNumberMap,
                       turn: number,
                       koCoord: MGPOptional<Coord>,
                       phase: Phase)
    {
        super(board, turn);
        this.captured = captured;
        this.koCoord = koCoord;
        this.phase = phase;
    }

    public getCapturedCopy(): PlayerNumberMap {
        return this.captured.getCopy();
    }

    public static getStartingBoard(config: GoConfig): GoPiece[][] {
        return TableUtils.create(config.width, config.height, GoPiece.EMPTY);
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
