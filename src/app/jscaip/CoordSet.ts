import { OptimizedSet } from '@everyboard/lib';

import { Coord } from './Coord';

export class CoordSet extends OptimizedSet<Coord> {

    protected toFields(coord: Coord): [[number], number] {
        return [[coord.y], coord.x];
    }

}
