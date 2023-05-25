import { Coord } from './Coord';
import { Encoder } from '../utils/Encoder';
import { Move } from './Move';
import { MGPFallible } from '../utils/MGPFallible';

export abstract class MoveWithTwoCoords extends Move {

    public static getEncoder<M extends MoveWithTwoCoords>(generator: (first: Coord, second: Coord) => MGPFallible<M>)
    : Encoder<M>
    {
        return Encoder.tuple(
            [Coord.encoder, Coord.encoder],
            (move: M): [Coord, Coord] => [move.first, move.second],
            (fields: [Coord, Coord]): M => generator(fields[0], fields[1]).get());
    }
    protected constructor(private readonly first: Coord, private readonly second: Coord) {
        super();
    }
    public getFirst(): Coord {
        return this.first;
    }
    public getSecond(): Coord {
        return this.second;
    }
}
