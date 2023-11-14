import { Coord } from './Coord';
import { Direction } from './Direction';
import { MGPFallible } from '../utils/MGPFallible';
import { RulesFailure } from './RulesFailure';
import { MoveWithTwoCoords } from './MoveWithTwoCoords';

export abstract class MoveCoordToCoord extends MoveWithTwoCoords {

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
        if (this === other) return true;
        if (this.getStart().equals(other.getStart()) === false) return false;
        return this.getEnd().equals(other.getEnd());
    }

    public getMovedOverCoords(): Coord[] {
        return this.getStart().getAllCoordsToward(this.getEnd());
    }

}
