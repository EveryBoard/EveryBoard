import { Coord } from '../../Coord';
import { Direction } from '../../direction/Direction';

export type GetNextCoordTestCase<D extends Direction> = {

    start: Coord;

    distance: number;

    direction: D;

    expectedDestination: Coord;

};
