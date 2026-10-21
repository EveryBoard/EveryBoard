import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Topology } from '../topology/Topology';

import { Shape } from './Shape';


export abstract class TopologicShape<D extends Direction> implements Shape<D> {

    public constructor(private readonly topology: Topology<D>) { }

    public getTopology(): Topology<D> {
        return this.topology;
    }

    public abstract getCenters(): Coord[];

    public abstract getAllCoords(): Coord[];

    public abstract isOnBoard(coord: Coord): boolean;

    public abstract getNextCoord(coord: Coord, direction: D, distance: number): MGPOptional<Coord>;

}
