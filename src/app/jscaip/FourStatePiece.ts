import { ComparableObject } from '../utils/Comparable';
import { Utils } from '../utils/utils';
import { Player, PlayerOrNone } from './Player';

export class FourStatePiece implements ComparableObject {

    public static ZERO: FourStatePiece = new FourStatePiece(Player.ZERO, true);

    public static ONE: FourStatePiece = new FourStatePiece(Player.ONE, true);

    public static EMPTY: FourStatePiece = new FourStatePiece(PlayerOrNone.NONE, true);

    public static UNREACHABLE: FourStatePiece = new FourStatePiece(PlayerOrNone.NONE, false);

    public static ofPlayer(player: Player): FourStatePiece {
        switch (player) {
            case Player.ZERO: return FourStatePiece.ZERO;
            default:
                Utils.expectToBe(player, Player.ONE);
                return FourStatePiece.ONE;
        }
    }

    private constructor(private readonly player: PlayerOrNone, private readonly reachable: boolean) {
    }

    public equals(other: FourStatePiece): boolean {
        return this.player.equals(other.player) &&
               this.reachable === other.reachable;
    }

    public is(player: Player): boolean {
        return this.player === player;
    }

    public isPlayer(): boolean {
        return this === FourStatePiece.ZERO || this === FourStatePiece.ONE;
    }

    public isReachable(): boolean {
        return this.reachable;
    }

    public getPlayer(): PlayerOrNone {
        return this.player;
    }

}
