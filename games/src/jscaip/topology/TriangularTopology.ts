import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Vector } from '../Vector';
import { TriangularDirection } from '../direction/TriangularDirection';

import { Topology } from './Topology';
import { TopologyID } from './TopologyMapper';

export class TriangularTopology implements Topology<TriangularDirection> {

    private readonly directions: Set<TriangularDirection> = new Set([
        TriangularDirection.LEFT,
        TriangularDirection.UP_LEFT,
        TriangularDirection.UP_RIGHT,
        TriangularDirection.RIGHT,
        TriangularDirection.DOWN_RIGHT,
        TriangularDirection.DOWN_LEFT,
    ]);

    public getId(): TopologyID {
        return 'TRIANGULAR';
    }

    public getDirections(): Set<TriangularDirection> {
        return this.directions;
    }

    public getNextCoord(coord: Coord, direction: TriangularDirection, distance: number = 1): Coord {
        console.log('getNextCoord(', coord.toString(), ', ', direction.toString(), ', ', distance, ')')
        if (distance === 0) {
            return coord;
        } else {
            const distanceSign: 1 | -1 = distance < 0 ? -1 : +1;
            const nextCoord: Coord = this.getNextImmediateNeighborCoord(coord, direction, distanceSign);
            const nextDistance: number = distance - distanceSign;
            return this.getNextCoord(nextCoord, direction, nextDistance);
        }
    }

    private getNextImmediateNeighborCoord(coord: Coord, direction: TriangularDirection, distance: 1 | -1): Coord {
        console.log('getNextImmediateNeighborCoord(', coord.toString(), ', ', direction.toString(), ', ', distance, ')')
        if (distance === -1) {
            return this.getNextImmediateNeighborCoord(coord, direction.getOpposite(), 1);
        }
        if (direction.y === 0) {
            return coord.getNext(direction, distance);
        }
        if (this.canGoUp(coord)) {
            if (direction.y === -1) {
                return new Coord(coord.x, coord.y - distance);
            }
        } else {
            if (direction.y === 1) {
                return new Coord(coord.x, coord.y + distance);
            }
        }
        return coord.getNext(new Vector(direction.x, 0), distance);
    }

    private canGoUp(c: Coord): boolean {
        return (c.x + c.y) % 2 === 1;
    }

    public getNeighbors(coord: Coord): Set<Coord> {
        return new Set([
            coord.getNext(TriangularDirection.LEFT),
            coord.getNext(TriangularDirection.RIGHT),
            this.canGoUp(coord) ?
                new Coord(coord.x, coord.y - 1) :
                new Coord(coord.x, coord.y + 1),
        ]);
    }

}
