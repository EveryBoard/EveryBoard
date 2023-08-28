import { Coord } from './Coord';
import { Direction } from './Direction';
import { MGPFallible } from '../utils/MGPFallible';
import { RulesFailure } from './RulesFailure';
import { MoveWithTwoCoords } from './MoveWithTwoCoords';
import { Encoder } from '../utils/Encoder';

export class MoveCoordToCoord extends MoveWithTwoCoords {

    public static encoder: Encoder<MoveCoordToCoord> = Encoder.tuple(
        [Coord.encoder, Coord.encoder],
        (move: MoveCoordToCoord) => [move.getStart(), move.getEnd()],
        (fields: [Coord, Coord]) => MoveCoordToCoord.of(fields[0], fields[1]));

    public static of(start: Coord, end: Coord): MoveCoordToCoord {
        return new MoveCoordToCoord(start, end);
    }
    public constructor(start: Coord, end: Coord) {
        super(start, end);
        if (start.equals(end)) throw new Error(RulesFailure.MOVE_CANNOT_BE_STATIC());
    }
    public length(): number {
        return this.getStart().getDistance(this.getEnd());
    }
    public getDirection(): MGPFallible<Direction> {
        return Direction.factory.fromMove(this.getStart(), this.getEnd());
    }
    public isOrthogonal(): boolean {
        const direction: MGPFallible<Direction> = this.getDirection();
        if (direction.isSuccess()) {
            return direction.get().isOrthogonal();
        } else {
            return false;
        }
    }
    public getStart(): Coord {
        return this.getFirst();
    }
    public getEnd(): Coord {
        return this.getSecond();
    }
    public equals(other: this): boolean {
        if (this === other) return true;
        if (this.getStart().equals(other.getStart()) === false) return false;
        return this.getEnd().equals(other.getEnd());
    }
    public toString(): string {
        return `${this.getStart().toString()} -> ${this.getEnd().toString()}`
    }
}
