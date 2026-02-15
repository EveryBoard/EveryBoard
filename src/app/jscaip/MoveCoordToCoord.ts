import { MGPFallible } from '@everyboard/lib';

import { Coord } from './Coord';
import { MoveWithTwoCoords } from './MoveWithTwoCoords';
import { Ordinal } from './Ordinal';
import { RulesFailure } from './RulesFailure';

export abstract class MoveCoordToCoord extends MoveWithTwoCoords {

    public constructor(start: Coord, end: Coord) {
        super(start, end);
        if (start.equals(end)) throw new Error(RulesFailure.MOVE_CANNOT_BE_STATIC());
    }

    public getDistance(): number {
        return this.getStart().getLinearDistanceToward(this.getEnd(), false);
    }

    public getDirection(): MGPFallible<Ordinal> {
        return Ordinal.factory.fromMove(this.getStart(), this.getEnd());
    }

    public getStart(): Coord {
        return this.getFirst();
    }

    public getEnd(): Coord {
        return this.getSecond();
    }

    public getMovedOverCoords(): Coord[] {
        return this.getStart().getAllCoordsToward(this.getEnd());
    }

    public getJumpedOverCoords(): Coord[] {
        return this.getStart().getCoordsToward(this.getEnd());
    }

    public equals(other: this): boolean {
        if (this === other) return true;
        if (this.getStart().equals(other.getStart()) === false) return false;
        return this.getEnd().equals(other.getEnd());
    }

    public toString(): string {
        const start: string = this.getStart().toString();
        const end: string = this.getEnd().toString();
        return `${start} -> ${end}`;
    }

}
