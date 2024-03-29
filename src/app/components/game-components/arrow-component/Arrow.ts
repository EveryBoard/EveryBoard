import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';

export class Arrow<T extends Direction> {
    public constructor(public start: Coord,
                       public startCenter: Coord,
                       public landing: Coord,
                       public landingCenter: Coord,
                       public dir: T,
                       public transformation: string) {}
}
