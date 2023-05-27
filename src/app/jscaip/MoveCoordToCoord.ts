import { Coord } from './Coord';
import { Direction } from './Direction';
import { MGPFallible } from '../utils/MGPFallible';
import { RulesFailure } from './RulesFailure';
import { MoveWithTwoCoords } from './MoveWithTwoCoords';

export abstract class MoveCoordToCoord extends MoveWithTwoCoords {

    public static equals<T extends MoveCoordToCoord>(first: T, second: T): boolean {
        if (first === second) return true;
        if (first.getStart().equals(second.getStart()) === false) return false;
        return first.getEnd().equals(second.getEnd());
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
    public getStart(): Coord {
        return this.getFirst();
    }
    public getEnd(): Coord {
        return this.getSecond();
    }
    public equals(other: this): boolean {
        return MoveCoordToCoord.equals(this, other);
    }
}
