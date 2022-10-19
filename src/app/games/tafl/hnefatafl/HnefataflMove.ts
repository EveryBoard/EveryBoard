import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflMove } from '../TaflMove';

export class HnefataflMove extends TaflMove {

    public static encoder: NumberEncoder<HnefataflMove> =
        MoveCoordToCoord.getEncoder<HnefataflMove>(11, 11, HnefataflMove.of);

    public static of(start: Coord, end: Coord): HnefataflMove {
        return new HnefataflMove(start, end);
    }
    public static from(start: Coord, end: Coord): MGPFallible<HnefataflMove> {
        try {
            const move: HnefataflMove = new HnefataflMove(start, end);
            return MGPFallible.success(move);
        } catch (e) {
            return MGPFallible.failure(e.message);
        }
    }
    public getMaximalDistance(): number {
        return 11;
    }
}