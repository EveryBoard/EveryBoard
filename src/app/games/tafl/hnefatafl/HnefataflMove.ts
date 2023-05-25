import { Coord } from 'src/app/jscaip/Coord';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { Encoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflMove } from '../TaflMove';

export class HnefataflMove extends TaflMove {

    public static encoder: Encoder<HnefataflMove> = MoveWithTwoCoords.getEncoder<HnefataflMove>(HnefataflMove.from);

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
