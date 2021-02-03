import { Move } from 'src/app/jscaip/Move';

// TODO: static instances
export class P4Move extends Move {
    public static ZERO : P4Move = new P4Move(0);
    public static ONE : P4Move = new P4Move(1);
    public static TWO : P4Move = new P4Move(2);
    public static THREE: P4Move = new P4Move(3);
    public static FOUR : P4Move = new P4Move(4);
    public static FIVE : P4Move = new P4Move(5);
    public static SIX : P4Move = new P4Move(6);

    public static encode(move: P4Move): number {
        return move.x;
    }
    public static decode(encodedMove: number): P4Move {
        return P4Move.of(encodedMove);
    }

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
    public encode(): number {
        return P4Move.encode(this);
    }
    public decode(n: number): P4Move {
        return P4Move.decode(n);
    }
    public hashCode(): number {
        return this.x;
    }
    public equals(o: P4Move): boolean {
        if (this === o) {
            return true;
        }
        if (o === null) {
            return false;
        }
        return this.x === o.x;
    }
    public toString(): string {
        return 'P4Move(' + this.x + ')';
    }
}
