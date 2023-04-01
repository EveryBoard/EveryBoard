import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflMove } from '../TaflMove';

export class BrandhubMove extends TaflMove {

    public static encoder: MoveEncoder<BrandhubMove> =
        MoveCoordToCoord.getEncoder<BrandhubMove>(BrandhubMove.of);

    public static of(start: Coord, end: Coord): BrandhubMove {
        return new BrandhubMove(start, end);
    }
    public static from(start: Coord, end: Coord): MGPFallible<BrandhubMove> {
        try {
            const move: BrandhubMove = new BrandhubMove(start, end);
            return MGPFallible.success(move);
        } catch (e) {
            return MGPFallible.failure(e.message);
        }
    }
    public getMaximalDistance(): number {
        return 7;
    }
}
