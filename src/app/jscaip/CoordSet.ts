import { Coord } from '../jscaip/Coord';
import { OptimizedSet } from '@everyboard/lib';

export class CoordSet extends OptimizedSet<Coord> {

    protected toFields(coord: Coord): [[number], number] {
        return [[coord.y], coord.x];
    }

}
