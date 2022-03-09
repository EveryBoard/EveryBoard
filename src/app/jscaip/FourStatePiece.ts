import { ComparableObject } from '../utils/Comparable';
import { Utils } from '../utils/utils';
import { Player, PlayerOrNone } from './Player';

export class FourStatePiece implements ComparableObject {

    public static ZERO: FourStatePiece = new FourStatePiece(Player.ZERO.value);

    public static ONE: FourStatePiece = new FourStatePiece(Player.ONE.value);

    public static EMPTY: FourStatePiece = new FourStatePiece(PlayerOrNone.NONE.value);

    public static NONE: FourStatePiece = new FourStatePiece(3);

    public static from(value: number): FourStatePiece {
        switch (value) {
            case FourStatePiece.ZERO.value:
                return FourStatePiece.ZERO;
            case FourStatePiece.ONE.value:
                return FourStatePiece.ONE;
            case FourStatePiece.EMPTY.value:
                return FourStatePiece.EMPTY;
            case FourStatePiece.NONE.value:
                return FourStatePiece.NONE;
            default:
                throw new Error('FourStatePiece has no value matching ' + value);
        }
    }
    public static ofPlayer(player: Player): FourStatePiece {
        switch (player) {
            case Player.ZERO: return FourStatePiece.ZERO;
            default:
                Utils.expectToBe(player, Player.ONE);
                return FourStatePiece.ONE;
        }
    }
    private constructor(public readonly value: number) {
    }
    public equals(o: ComparableObject): boolean {
        return this === o;
    }
    public is(player: Player): boolean {
        return this.value === player.value;
    }
    public isPlayer(): boolean {
        return this === FourStatePiece.ZERO || this === FourStatePiece.ONE;
    }
}
