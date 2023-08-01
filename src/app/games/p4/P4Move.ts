import { Encoder } from 'src/app/utils/Encoder';
import { Move } from 'src/app/jscaip/Move';

export class P4Move extends Move {
    public static ZERO: P4Move = new P4Move(0);
    public static ONE: P4Move = new P4Move(1);
    public static TWO: P4Move = new P4Move(2);
    public static THREE: P4Move = new P4Move(3);
    public static FOUR: P4Move = new P4Move(4);
    public static FIVE: P4Move = new P4Move(5);
    public static SIX: P4Move = new P4Move(6);

    public static encoder: Encoder<P4Move> = Encoder.tuple(
        [Encoder.identity<number>()],
        (move: P4Move) => [move.x],
        (value: [number]) => P4Move.of(value[0]),
    );
    public static of(n: number): P4Move {
        switch (n) {
            case 0: return P4Move.ZERO;
            case 1: return P4Move.ONE;
            case 2: return P4Move.TWO;
            case 3: return P4Move.THREE;
            case 4: return P4Move.FOUR;
            case 5: return P4Move.FIVE;
            case 6: return P4Move.SIX;
            default: throw new Error('Invalid P4Move');
        }
    }

    private constructor(public readonly x: number) {
        super();
    }
    public equals(other: P4Move): boolean {
        return this === other;
    }
    public toString(): string {
        return 'P4Move(' + this.x + ')';
    }
}
