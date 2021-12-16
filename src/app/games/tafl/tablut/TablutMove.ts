import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflMove } from '../TaflMove';

export class TablutMove extends TaflMove {

    public static encoder: NumberEncoder<TablutMove> =
        MoveCoordToCoord.getEncoder<TablutMove>(9, 9, TablutMove.of);

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
