import { assert } from 'src/app/utils/utils/utils';
import { NumberEncoder } from '../encoder';

export class Player {
    public static numberEncoder: NumberEncoder<Player> = NumberEncoder.ofN(2, (player: Player) => {
        return player.value;
    }, (encoded: number) => {
        return Player.of(encoded);
    });
    public static readonly ZERO: Player = new Player(0);
    public static readonly ONE: Player = new Player(1);
    public static readonly NONE: Player = new Player(2);

    public static of(value: number): Player {
        switch (value) {
            case 0: return Player.ZERO;
            case 1: return Player.ONE;
            case 2: return Player.NONE;
            default: throw new Error('Unknown Player value ' + value);
        }
    }

    private constructor(public readonly value: number) {}

    public toString(): string {
        return 'Player ' + this.value;
    }
    public getScoreModifier(): number {
        switch (this.value) {
            case 0: return -1;
            case 1: return 1;
            default: throw new Error('No score modifier');
        }
    }
    public getPreVictory(): number {
        return this.getVictoryValue() - this.getScoreModifier();
    }
    public getDefeatValue(): number {
        assert(this !== Player.NONE, 'Should not call getDefeatValue on Player.NONE!');
        if (this === Player.ZERO) {
            return Number.MAX_SAFE_INTEGER;
        } else {
            return Number.MIN_SAFE_INTEGER;
        }
    }
    public getVictoryValue(): number {
        assert(this !== Player.NONE, 'Should not call getVictoryValue on Player.NONE!');
        if (this === Player.ZERO) {
            return Number.MIN_SAFE_INTEGER;
        } else {
            return Number.MAX_SAFE_INTEGER;
        }
    }
}
