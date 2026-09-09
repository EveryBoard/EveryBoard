import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Topology } from '../topology/Topology';

export interface Shape {

    getCenters(): Coord[];

    getAllCoords(): Coord[];

}

export abstract class TopologicShape implements Shape {

    public constructor(private readonly topology: Topology<Direction>) {}

    public abstract getCenters(): Coord[];

    public abstract getAllCoords(): Coord[];

}
