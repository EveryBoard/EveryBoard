import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../direction/Direction';

import { TopologyID as TopologyId } from './TopologyMapper';

// A topology describes the neighboring relationship between spaces
export interface Topology<T extends Direction> {

    getId(): TopologyId;

    // returns the direction that this topology uses (includes opposites)
    getDirections(): Set<T>;

    // computes the next coord in the given direction without checking if it is on the board
    // TODO: make sure that it's not used cause we should actually use shape.getNextCoord() (cause it include the isOnBoard logic)
    getNextCoord(coord: Coord, direction: T, distance: number): Coord;

    getNeighbors(coord: Coord): Set<Coord>;
}
