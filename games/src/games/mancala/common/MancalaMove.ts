import { ArrayUtils, Encoder, Utils } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { Move } from '../../../jscaip/Move';

export type MancalaDistributionDirection = 'CLOCKWISE' | 'UP';

export class MancalaDistribution {

    public static encoder: Encoder<MancalaDistribution> = Encoder.tuple(
        [Encoder.identity<number>(), Encoder.identity<number>(), Encoder.identity<number>()],
        (distribution: MancalaDistribution) => [distribution.direction, distribution.coord.x, distribution.coord.y],
        (value: [MancalaDistributionDirection, number, number]) => MancalaDistribution.of(value[0], value[1], value[2]),
    );

    public static of(direction: MancalaDistributionDirection, x: number, y: number): MancalaDistribution {
        Utils.assert(0 <= x, 'MancalaDistribution.coord.x should be a positive integer!');
        Utils.assert(0 <= y, 'MancalaDistribution.coord.y should be a positive integer!');
        return new MancalaDistribution(direction, x, y);
    }

    public readonly coord: Coord;

    protected constructor(
        public readonly direction: MancalaDistributionDirection,
        x: number,
        y: number,
    ) {
        this.coord = new Coord(x, y);
    }

    public equals(other: MancalaDistribution): boolean {
        if (other === this) return true;
        if (other.coord.equals(this.coord) === false) return false;
        return other.direction === this.direction;
    }

}

export class MancalaMove extends Move {

    public static encoder: Encoder<MancalaMove> = Encoder.tuple(
        [Encoder.list(MancalaDistribution.encoder)],
        (move: MancalaMove) => [move.distributions],
        (value: [MancalaDistribution[]]) => MancalaMove.of(value[0][0], value[0].slice(1)),
    );

    public static of(mandatory: MancalaDistribution, bonus: MancalaDistribution[] = []): MancalaMove {
        const distributions: MancalaDistribution[] = [mandatory];
        distributions.push(...bonus);
        return new MancalaMove(distributions);
    }

    protected constructor(public readonly distributions: MancalaDistribution[]) {
        super();
        Utils.assert(distributions.length > 0, 'Move should have distribution ');
    }

    public add(move: MancalaDistribution): MancalaMove {
        return MancalaMove.of(
            this.distributions[0],
            this.distributions.slice(1).concat(move),
        );
    }

    public override toString(): string {
        const distributions: string[] = this.distributions.map(
            (d: MancalaDistribution) => '(' + d.direction + ', ' + d.coord.x + ', ' + d.coord.y + ')',
        );
        return 'MancalaMove([' + distributions.join(', ') + '])';
    }

    public override equals(other: this): boolean {
        return ArrayUtils.equals(this.distributions, other.distributions);
    }

    public getFirstDistribution(): MancalaDistribution {
        return this.distributions[0];
    }

    public [Symbol.iterator](): IterableIterator<MancalaDistribution> {
        return this.distributions.values();
    }
}
