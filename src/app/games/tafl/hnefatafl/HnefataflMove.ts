import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflMove } from '../TaflMove';

export class HnefataflMove extends TaflMove {

    public static encoder: MoveEncoder<HnefataflMove> =
        MoveCoordToCoord.getEncoder<HnefataflMove>(HnefataflMove.of);

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
