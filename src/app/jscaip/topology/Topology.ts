import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';

export interface Topology<T extends Direction> {

    // So Up and Down are the axe "vertical" of which your provide only one of the two
    getDirections(): Set<T>;

    // Does not known wether or not the coord is in board
    getNextCoord(coord: Coord, direction: T, distance: number): Coord;

    getNeighbors(coord: Coord): Set<Coord>;
}
