import { Set } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Vector } from '../Vector';

export interface Topology {

    // So Up and Down are the axe "vertical" of which your provide only one of the two
    getDirections(): Set<Direction>;

    // Does not known wether or not the coord is in board
    getNextCoord(coord: Coord, direction: Vector, distance: number): Coord;

    getNeighbors(coord: Coord): Set<Coord>;
}
