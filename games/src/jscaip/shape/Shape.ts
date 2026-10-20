import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../Coord';
import { Direction } from '../Direction';

export interface Shape<D extends Direction> {

    getCenters(): Coord[];

    getAllCoords(): Coord[];

    isOnBoard(coord: Coord): boolean;

    getNextCoord(coord: Coord, direction: D, distance: number): MGPOptional<Coord>;

}

