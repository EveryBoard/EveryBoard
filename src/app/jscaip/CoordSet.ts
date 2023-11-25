import { Coord } from '../jscaip/Coord';

export class CoordSet extends OptimizedSet<Coord> {
    protected toFields(coord: Coord): [[number], number] {
        return [[coord.y], coord.x];
    }
}
