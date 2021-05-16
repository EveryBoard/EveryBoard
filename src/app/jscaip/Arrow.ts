import { Coord } from 'src/app/jscaip/Coord';

export class Arrow {
    public constructor(public readonly source: Coord,
                       public readonly destination: Coord,
                       public readonly x1: number,
                       public readonly y1: number,
                       public readonly x2: number,
                       public readonly y2: number) {}
}
