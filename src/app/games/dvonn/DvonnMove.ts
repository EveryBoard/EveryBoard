import { Coord } from 'src/app/jscaip/Coord';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { DvonnState } from './DvonnState';
import { MoveWithTwoCoords } from 'src/app/jscaip/MoveWithTwoCoords';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class DvonnMove extends MoveCoordToCoord {

    public static PASS: DvonnMove = new DvonnMove(new Coord(-1, -1), new Coord(-2, -2));

    public static encoder: MoveEncoder<DvonnMove> = MoveWithTwoCoords.getEncoder(DvonnMove.from);

    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public static from(start: Coord, end: Coord): MGPFallible<DvonnMove> {
        if (start.x === -1 && start.y === -1 && end.x === -2 && end.y === -2) {
            // PASS move
            return MGPFallible.success(DvonnMove.PASS);
        }
        // Move should be on board
        if (!DvonnState.isOnBoard(start)) {
            return MGPFallible.failure('Starting coord of DvonnMove must be on the board, not at ' + start.toString());
        }
        if (!DvonnState.isOnBoard(end)) {
            return MGPFallible.failure('End coord of DvonnMove must be on the board, not at ' + start.toString());
        }
        // Move should be a straight line
        if (start.y === end.y) {
            // vertical move, allowed
            return MGPFallible.success(new DvonnMove(start, end));
        } else if (start.x === end.x) {
            // horizontal move, allowed
            return MGPFallible.success(new DvonnMove(start, end));
        } else if (start.x + start.y === end.x + end.y) {
            // diagonal move, allowed
            return MGPFallible.success(new DvonnMove(start, end));
        } else {
            return MGPFallible.failure('Invalid move');
        }
    }
    public static of(start: Coord, end: Coord): DvonnMove {
        const result: MGPFallible<DvonnMove> = DvonnMove.from(start, end);
        if (result.isSuccess()) {
            return result.get();
        } else {
            throw new Error(result.getReason());
        }
    }
    public toString(): string {
        if (this === DvonnMove.PASS) {
            return 'DvonnMove.PASS';
        }
        return 'DvonnMove(' + this.getStart() + '->' + this.getEnd() + ')';
    }
    public length(): number {
        if (this.getStart().y === this.getEnd().y) {
            return Math.abs(this.getStart().x - this.getEnd().x);
        } else if (this.getStart().x === this.getEnd().x) {
            return Math.abs(this.getStart().y - this.getEnd().y);
        } else {
            return Math.abs(this.getStart().y - this.getEnd().y);
        }
    }
    public equals(other: DvonnMove): boolean {
        if (other === this) return true;
        if (!other.getStart().equals(this.getStart())) return false;
        return other.getEnd().equals(this.getEnd());
    }
}
