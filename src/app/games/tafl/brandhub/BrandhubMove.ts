import { Coord } from 'src/app/jscaip/Coord';
import { TaflMove } from '../TaflMove';

export class BrandhubMove extends TaflMove {

    public static from(start: Coord, end: Coord): BrandhubMove {
        return new BrandhubMove(start, end);
    }
    public getWidth(): number {
        return 7;
    }
}
