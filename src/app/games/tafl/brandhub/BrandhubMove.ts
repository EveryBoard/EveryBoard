import { Coord } from 'src/app/jscaip/Coord';
import { TaflEncoder, TaflMove } from '../TaflMove';

export class BrandhubMove extends TaflMove {

    public static encoder: TaflEncoder<BrandhubMove> = new TaflEncoder(7, BrandhubMove.from);

    public static from(start: Coord, end: Coord): BrandhubMove {
        return new BrandhubMove(start, end);
    }
    public getWidth(): number {
        return 7;
    }
}
