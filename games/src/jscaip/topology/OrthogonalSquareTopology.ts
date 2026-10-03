import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Orthogonal } from '../Orthogonal';

import { Topology } from './Topology';


export class OrthogonalSquareTopology implements Topology<Orthogonal> {

    private readonly directions: Set<Orthogonal> = new Set([
        Orthogonal.UP,
        Orthogonal.RIGHT,
        Orthogonal.DOWN,
        Orthogonal.LEFT,
    ]);

    public getDirections(): Set<Orthogonal> {
        return this.directions;
    }

    public getNextCoord(coord: Coord, direction: Orthogonal, distance: number = 1): Coord {
        return coord.getNext(direction, distance);
    }

    public getNeighbors(coord: Coord): Set<Coord> {
        return new Set([
            ...this.getDirections().map(
                (direction: Orthogonal) => this.getNextCoord(coord, direction),
            ),
            ...this.getDirections().map(
                (direction: Orthogonal) => this.getNextCoord(coord, direction, -1),
            ),
        ]);
    }

}
