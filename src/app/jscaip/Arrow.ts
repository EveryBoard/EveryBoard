import { Coord } from 'src/app/jscaip/Coord';
import { Line } from './Line';

export class Arrow extends Line {
    public constructor(public readonly source: Coord,
                       public readonly destination: Coord, // Not used anymore but logical and usefull, should I kill it ?
                       x1: number,
                       y1: number,
                       x2: number,
                       y2: number)
    {
        super(x1, y1, x2, y2);
    }
}
