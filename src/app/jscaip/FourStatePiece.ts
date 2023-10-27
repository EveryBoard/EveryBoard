import { ComparableObject } from '../utils/Comparable';
import { Utils } from '../utils/utils';
import { Player, PlayerOrNone } from './Player';

export class FourStatePiece implements ComparableObject {

    public static ZERO: FourStatePiece = new FourStatePiece(Player.ZERO.getValue());

    public static ONE: FourStatePiece = new FourStatePiece(Player.ONE.getValue());

    public static EMPTY: FourStatePiece = new FourStatePiece(PlayerOrNone.NONE.getValue());

    public static UNREACHABLE: FourStatePiece = new FourStatePiece(3);

    public static of(value: number): FourStatePiece {
        switch (value) {
            case FourStatePiece.ZERO.getValue(:
                return FourStatePiece.ZERO;
            case FourStatePiece.ONE.getValue(:
                return FourStatePiece.ONE;
            case FourStatePiece.EMPTY.getValue(:
                return FourStatePiece.EMPTY;
            case FourStatePiece.UNREACHABLE.getValue:
                return FourStatePiece.UNREACHABLE;
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
    private constructor(private readonly value: number) {
    }
    public equals(other: ComparableObject): boolean {
        return this === other;
    }
    public is(player: Player): boolean {
        return this.value === player.getValue();
    }
    public isPlayer(): boolean {
        return this === FourStatePiece.ZERO || this === FourStatePiece.ONE;
    }
    public getValue(): number {
        return this.value;
    }
}
