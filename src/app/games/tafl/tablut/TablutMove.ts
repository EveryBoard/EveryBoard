import { Coord } from 'src/app/jscaip/Coord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflMove } from '../TaflMove';

export class TablutMove extends TaflMove {

    public static encoder: Encoder<TablutMove> = MoveWithTwoCoords.getEncoder<TablutMove>(TablutMove.from);

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
