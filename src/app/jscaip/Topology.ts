import { Coord } from './Coord';
import { Direction } from './Direction';

export interface Topology {

    // So Up and Down are the axe "vertical" of which your provide only one of the two
    getDirections(): Direction[];

    getNextCoord(coord: Coord, direction: Direction): Coord;

    getAllCoords(): Coord[];

}
