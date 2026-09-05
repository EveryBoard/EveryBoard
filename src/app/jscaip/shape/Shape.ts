import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Topology } from '../topology/Topology';

export interface Shape {

    getCenters(): Coord[];

    getAllCoords(): Coord[];

    getNextCoord(coord: Coord, direction: Direction): Coord;

}

export abstract class TopologicShape {

    public constructor(private readonly topology: Topology) {}

    public getNextCoord(coord: Coord, direction: Direction): Coord {
        return this.topology.getNextCoord(coord, direction);
    }
}
