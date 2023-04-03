import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Direction } from 'src/app/jscaip/Direction';
import { TaflFailure } from './TaflFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export abstract class TaflMove extends MoveCoordToCoord {

    protected constructor(start: Coord, end: Coord) {
        super(start, end);
        if (start.isNotInRange(this.getMaximalDistance(), this.getMaximalDistance())) {
            throw new Error('Starting coord of TaflMove must be on the board, not at ' + start.toString() + '.');
        }
        if (end.isNotInRange(this.getMaximalDistance(), this.getMaximalDistance())) {
            throw new Error('Landing coord of TaflMove must be on the board, not at ' + end.toString() + '.');
        }
        const dir: MGPFallible<Direction> = start.getDirectionToward(end);
        if (dir.isFailure() || dir.get().isDiagonal()) {
            throw new Error(TaflFailure.MOVE_MUST_BE_ORTHOGONAL());
        }
    }
    public equals(other: TaflMove): boolean {
        if (other === this) return true;
        if (other.getStart().equals(this.getStart()) === false) return false;
        return other.getEnd().equals(this.getEnd());
    }
    public toString(): string {
        return 'TaflMove(' + this.getStart() + '->' + this.getEnd() + ')';
    }
    public abstract getMaximalDistance(): number;
}
