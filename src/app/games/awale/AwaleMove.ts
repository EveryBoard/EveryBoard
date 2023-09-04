import { Encoder } from 'src/app/utils/Encoder';
import { Move } from 'src/app/jscaip/Move';

export class AwaleMove extends Move {

    public static encoder: Encoder<AwaleMove> = Encoder.tuple(
        [Encoder.identity<number>()],
        (coord: AwaleMove) => [coord.x],
        (value: [number]) => AwaleMove.of(value[0]),
    );
    public static of(x: number): AwaleMove {
        return new AwaleMove(x);
    }
    private constructor(public readonly x: number) {
        super();
    }
    public equals(other: AwaleMove): boolean {
        if (other === this) return true;
        return other.x === this.x;
    }
    public toString(): string {
        return 'AwaleMove(' + this.x + ')';
    }
}
