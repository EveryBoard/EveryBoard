import { Encoder, Utils } from '@everyboard/lib';
import { Move } from 'src/app/jscaip/Move';

export class P4Move extends Move {

    public static encoder: Encoder<P4Move> = Encoder.tuple(
        [Encoder.identity<number>()],
        (move: P4Move) => [move.x],
        (value: [number]) => P4Move.of(value[0]),
    );

    public static of(x: number): P4Move {
        Utils.assert(0 <= x, 'P4Move should be a positive integer!');
        return new P4Move(x);
    }

    private constructor(public readonly x: number) {
        super();
    }

    public equals(other: P4Move): boolean {
        return this.x === other.x;
    }

    public toString(): string {
        return 'P4Move(' + this.x + ')';
    }

}
