import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { TaflEncoder, TaflMove } from '../TaflMove';

export class BrandhubMove extends TaflMove {

    public static encoder: TaflEncoder<BrandhubMove> = new TaflEncoder(7, BrandhubMove.instanceProvider);

    public static instanceProvider(start: Coord, end: Coord): BrandhubMove {
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
