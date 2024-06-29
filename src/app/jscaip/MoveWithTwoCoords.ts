import { Coord } from './Coord';
import { Encoder, MGPFallible } from '@everyboard/lib';
import { Move } from './Move';

export abstract class MoveWithTwoCoords extends Move {

    public static getFallibleEncoder<M extends MoveWithTwoCoords>(
        generator: (first: Coord, second: Coord) => MGPFallible<M>)
    : Encoder<M>
    {
        return Encoder.tuple(
            [Coord.encoder, Coord.encoder],
            (move: M): [Coord, Coord] => [move.first, move.second],
            (fields: [Coord, Coord]): M => generator(fields[0], fields[1]).get());
    }
    public static getEncoder<M extends MoveWithTwoCoords>(generator: (first: Coord, second: Coord) => M): Encoder<M> {
        return Encoder.tuple(
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
    public getCoords(): [Coord, Coord] {
        return [this.first, this.second];
    }
}
