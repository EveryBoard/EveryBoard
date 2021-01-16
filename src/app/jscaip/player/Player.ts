export class Player {
    public static readonly ZERO = new Player(0);

    public static readonly ONE = new Player(1);

    public static readonly NONE = new Player(2);

    private constructor(public readonly value: number) {}

    public static of(value: number): Player {
        switch (value) {
        case 0: return Player.ZERO;
        case 1: return Player.ONE;
        case 2: return Player.NONE;
        default: throw new Error('Unknown Player value ' + value);
        }
    }

    public toString(): string {
        return 'Player ' + this.value;
    }
}
