import { Coord } from '../Coord';
import { Direction } from '../Direction';
import { Vector } from '../Vector';

export interface Topology {

    // So Up and Down are the axe "vertical" of which your provide only one of the two
    getDirections(): Direction[];

    // Does not known wether or not the coord is in board
    getNextCoord(coord: Coord, direction: Vector): Coord;

    getNeighbors(coord: Coord): Coord[];
}
