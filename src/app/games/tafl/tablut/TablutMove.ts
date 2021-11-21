import { Coord } from 'src/app/jscaip/Coord';
import { TaflEncoder, TaflMove } from '../TaflMove';

export class TablutMove extends TaflMove {

    public static encoder: TaflEncoder<TablutMove> = new TaflEncoder(9, TablutMove.from);

    public static from(start: Coord, end: Coord): TablutMove {
        return new TablutMove(start, end);
    }

    public getWidth(): number {
        return 9;
    }
}
