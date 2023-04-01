import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoder } from 'src/app/utils/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { DvonnState } from './DvonnState';

export class DvonnMove extends MoveCoordToCoord {

    public static PASS: DvonnMove = new DvonnMove(new Coord(-1, -1), new Coord(-2, -2));
    public static encoder: NumberEncoder<DvonnMove> = new class extends NumberEncoder<DvonnMove> { // TODOTODO: kill him and check all MCTC and MWTC !
        public maxValue(): number {
            return 10 * 4096 + 4 * 256 + 10 * 16 + 4;
        }
        public encodeNumber(move: DvonnMove): number {
            const x1: number = move.getStart().x;
            const y1: number = move.getStart().y;
            const x2: number = move.getEnd().x;
            const y2: number = move.getEnd().y;
            return (x1 * 4096) + (y1 * 256) + (x2 * 16) + y2;
        }
        public decodeNumber(encodedMove: number): DvonnMove {
            if (encodedMove < 0) return DvonnMove.PASS;
            const y2: number = encodedMove % 16;
            encodedMove = (encodedMove / 16) | 0;
            const x2: number = encodedMove % 16;
            encodedMove = (encodedMove / 16) | 0;
            const y1: number = encodedMove % 16;
            encodedMove = (encodedMove / 16) | 0;
            const x1: number = encodedMove % 16;
            return new DvonnMove(new Coord(x1, y1), new Coord(x2, y2));
        }
    };
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public static of(start: Coord, end: Coord): DvonnMove {
        if (start.x === -1 && start.y === -1 && end.x === -2 && end.y === -2) {
            // PASS move
            return DvonnMove.PASS;
        }
        // Move should be on board
        if (!DvonnState.isOnBoard(start)) {
            throw new Error('Starting coord of DvonnMove must be on the board, not at ' + start.toString());
        }
        if (!DvonnState.isOnBoard(end)) {
            throw new Error('End coord of DvonnMove must be on the board, not at ' + start.toString());
        }
        // Move should be a straight line
        if (start.y === end.y) {
            // vertical move, allowed
            return new DvonnMove(start, end);
        } else if (start.x === end.x) {
            // horizontal move, allowed
            return new DvonnMove(start, end);
        } else if (start.x + start.y === end.x + end.y) {
            // diagonal move, allowed
            return new DvonnMove(start, end);
        } else {
            throw new Error('Invalid move');
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
    public equals(o: DvonnMove): boolean {
        if (o === this) return true;
        if (!o.getStart().equals(this.getStart())) return false;
        return o.getEnd().equals(this.getEnd());
    }
}
