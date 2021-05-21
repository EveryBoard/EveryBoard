import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { DvonnBoard } from './DvonnBoard';

export class DvonnMove extends MoveCoordToCoord {
    public static PASS: DvonnMove = new DvonnMove(new Coord(-1, -1), new Coord(-2, -2));
    public static encoder: NumberEncoder<DvonnMove> = new class extends NumberEncoder<DvonnMove> {
        public maxValue(): number {
            return 10 * 4096 + 4 * 256 + 10 * 16 + 4;
        }
        public encodeNumber(move: DvonnMove): number {
            const x1: number = move.coord.x;
            const y1: number = move.coord.y;
            const x2: number = move.end.x;
            const y2: number = move.end.y;
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
    }
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public static of(start: Coord, end: Coord): DvonnMove {
        if (start.x === -1 && start.y === -1 && end.x === -2 && end.y === -2) {
            // PASS move
            return DvonnMove.PASS;
        }
        // Move should be on board
        if (!DvonnBoard.isOnBoard(start)) {
            throw new Error('Starting coord of DvonnMove must be on the board, not at ' + start.toString());
        }
        if (!DvonnBoard.isOnBoard(end)) {
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
        return 'DvonnMove(' + this.coord + '->' + this.end + ')';
    }
    public length(): number {
        if (this.coord.y === this.end.y) {
            return Math.abs(this.coord.x - this.end.x);
        } else if (this.coord.x === this.end.x) {
            return Math.abs(this.coord.y - this.end.y);
        } else {
            return Math.abs(this.coord.y - this.end.y);
        }
    }
    public equals(o: DvonnMove): boolean {
        if (o === this) return true;
        if (!o.coord.equals(this.coord)) return false;
        return o.end.equals(this.end);
    }
}
