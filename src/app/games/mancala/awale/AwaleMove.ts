import { Encoder } from 'src/app/utils/Encoder';
import { Utils } from 'src/app/utils/utils';
import { MancalaDistribution, MancalaMove } from '../commons/MancalaMove';

export class AwaleMove extends MancalaMove {

    public static encoder: Encoder<AwaleMove> = Encoder.tuple(
        [Encoder.identity<number>()],
        (coord: AwaleMove) => [coord.x],
        (value: [number]) => AwaleMove.of(value[0]),
    );

    public static of(x: number): AwaleMove {
        Utils.assert(x >= 0, 'No negative index allowed at Mancalas');
        return new AwaleMove(x);
    }

    private constructor(public readonly x: number) {
        super([MancalaDistribution.of(x)]);
    }

    public equals(other: AwaleMove): boolean {
        if (other === this) return true;
        return other.x === this.x;
    }

    public toString(): string {
        return 'AwaleMove(' + this.x + ')';
    }
}
