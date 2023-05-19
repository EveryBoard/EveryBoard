import { Coord } from './Coord';
import { MoveEncoder } from '../utils/Encoder';
import { Move } from './Move';
import { MGPFallible } from '../utils/MGPFallible';

export abstract class MoveWithTwoCoords extends Move {

    public static getFallibleEncoder<M extends MoveWithTwoCoords>(
        generator: (first: Coord, second: Coord) => MGPFallible<M>)
    : MoveEncoder<M>
    {
        return MoveWithTwoCoords.getEncoder((first: Coord, second: Coord): M => generator(first, second).get());
    }
    public static getEncoder<M extends MoveWithTwoCoords>(generator: (first: Coord, second: Coord) => M)
    : MoveEncoder<M>
    {
        return MoveEncoder.tuple(
            [Coord.encoder, Coord.encoder],
            (move: M): [Coord, Coord] => [move.first, move.second],
            (fields: [Coord, Coord]): M => generator(fields[0], fields[1]));
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
