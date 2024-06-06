import { Coord } from '../jscaip/Coord';
import { ImmutableOptimizedSet } from '@everyboard/lib';

export class CoordSet extends ImmutableOptimizedSet<Coord> {

    protected toFields(coord: Coord): [[number], number] {
        return [[coord.y], coord.x];
    }

}
