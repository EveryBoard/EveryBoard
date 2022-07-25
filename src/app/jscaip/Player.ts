import { Utils } from 'src/app/utils/utils';
import { ComparableObject } from 'src/app/utils/Comparable';
import { NumberEncoder } from '../utils/Encoder';

class PlayerNone implements ComparableObject {
    public static NONE: PlayerNone = new PlayerNone();
    public value: number = 2;
    private constructor() {
    }
    public isPlayer(): this is Player {
        return false;
    }
    public toString(): string {
        return 'PlayerNone';
    }
    public equals(other: PlayerOrNone): boolean {
        return this === other;
    }
}

export class Player implements ComparableObject {

    public static numberEncoder: NumberEncoder<PlayerOrNone> = NumberEncoder.ofN(2, (player: PlayerOrNone) => {
        return player.value;
    }, (encoded: number) => {
        if (encoded === 2) return PlayerOrNone.NONE;
        return Player.of(encoded);
    });
    public static readonly ZERO: Player = new Player(0);
    public static readonly ONE: Player = new Player(1);
    public static readonly PLAYERS: Player[] = [Player.ZERO, Player.ONE];

    public static of(value: number): Player {
        switch (value) {
            case 0: return Player.ZERO;
            default:
                Utils.expectToBe(value, 1);
                return Player.ONE;
        }
    }
    public static fromTurn(turn: number): Player {
        return turn % 2 === 0 ? Player.ZERO : Player.ONE;
    }
    protected constructor(public readonly value: number) {}

    public isPlayer(): this is Player {
        return true;
    }
    public toString(): string {
        return 'Player ' + this.value;
    }
    public equals(other: PlayerOrNone): boolean {
        return this === other;
    }
    public getScoreModifier(): number {
        if (this.value === 0) return -1;
        return 1;
    }
    public getPreVictory(): number {
        return this.getVictoryValue() - this.getScoreModifier();
    }
    public getDefeatValue(): number {
        if (this === Player.ZERO) {
            return Number.MAX_SAFE_INTEGER;
        } else {
            return Number.MIN_SAFE_INTEGER;
        }
    }
    public getVictoryValue(): number {
        if (this === Player.ZERO) {
            return Number.MIN_SAFE_INTEGER;
        } else {
            return Number.MAX_SAFE_INTEGER;
        }
    }
    public getOpponent(): Player {
        switch (this) {
            case Player.ZERO: return Player.ONE;
            default:
                Utils.expectToBe(this, Player.ONE);
                return Player.ZERO;
        }
    }
}

export type PlayerOrNone = Player | PlayerNone

// eslint-disable-next-line no-redeclare, @typescript-eslint/no-redeclare
export namespace PlayerOrNone {
    export const ZERO: Player = Player.ZERO;
    export const ONE: Player = Player.ONE;
    export const NONE: PlayerNone = PlayerNone.NONE;
}
