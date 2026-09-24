import { MGPOptional } from '@everyboard/lib';

import { Coord } from './Coord';
import { Direction } from './Direction';
import { NInARowHelper } from './NInARowHelper';
import { PlayerOrNone } from './Player';
import { TopologicShape } from './shape/Shape';

export class TopologicNInARowHelper<T extends NonNullable<unknown>, D extends Direction>
    extends NInARowHelper<T, D>
{

    public constructor(
        getOwner: (piece: T) => PlayerOrNone,
        N: number,
        public readonly shape: TopologicShape<D>,
    ) {
        super(getOwner, N);
    }

    protected override getDirections(): ReadonlyArray<D> {
        return this.shape.getTopology().getDirections().toList();
    }

    protected override getNextCoord(coord: Coord, dir: D, distance: number = 1): MGPOptional<Coord> {
        return this.shape.getNextCoord(coord, dir, distance);
        // TODO: Toric shape must only have EVEN triangular board
    }
}
