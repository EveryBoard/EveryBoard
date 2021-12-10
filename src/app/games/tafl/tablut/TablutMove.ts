import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflEncoder, TaflMove } from '../TaflMove';

export class TablutMove extends TaflMove {

    public static encoder: TaflEncoder<TablutMove> = new TaflEncoder(9, TablutMove.of);

    public static of(start: Coord, end: Coord): TablutMove {
        return new TablutMove(start, end);
    }
    public static from(start: Coord, end: Coord): MGPFallible<TablutMove> {
        try {
            const move: TablutMove = new TablutMove(start, end);
            return MGPFallible.success(move);
        } catch (e) {
            return MGPFallible.failure(e.message);
        }
    }
    public getMaximalDistance(): number {
        return 9;
    }
}
