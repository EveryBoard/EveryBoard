import { Coord } from 'src/app/jscaip/Coord';
import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { KamisadoBoard } from './KamisadoBoard';

export class KamisadoMove extends MoveCoordToCoord {
    // The PASS move is encoded as a MoveCoordToCoord that is out of the board
    public static PASS: KamisadoMove = new KamisadoMove(new Coord(-2, -2), new Coord(-3, -3));
    public static encoder: NumberEncoder<KamisadoMove> = new class extends NumberEncoder<KamisadoMove> {
        public maxValue(): number {
            return 8 * 4096 + 8 * 256 + 8 * 16 + 8;
        }
        public encodeNumber(move: KamisadoMove): number {
            const x1: number = move.coord.x;
            const y1: number = move.coord.y;
            const x2: number = move.end.x;
            const y2: number = move.end.y;
            return (x1 * 4096) + (y1 * 256) + (x2 * 16) + y2;
        }
        public decodeNumber(encodedMove: number): KamisadoMove {
            if (encodedMove < 0) return KamisadoMove.PASS;
            const y2: number = encodedMove % 16;
            encodedMove = (encodedMove / 16) | 0;
            const x2: number = encodedMove % 16;
            encodedMove = (encodedMove / 16) | 0;
            const y1: number = encodedMove % 16;
            encodedMove = (encodedMove / 16) | 0;
            const x1: number = encodedMove % 16;
            return new KamisadoMove(new Coord(x1, y1), new Coord(x2, y2));
        }
    }
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public static of(start: Coord, end: Coord): KamisadoMove {
        if (start.isNotInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE)) {
            throw new Error('Starting coord of KamisadoMove must be on the board, not at ' + start.toString());
        }
        if (end.isNotInRange(KamisadoBoard.SIZE, KamisadoBoard.SIZE)) {
            throw new Error('End coord of KamisadoMove must be on the board, not at ' + end.toString());
        }
        return new KamisadoMove(start, end);
    }
    public equals(o: KamisadoMove): boolean {
        if (o === this) return true;
        if (!o.coord.equals(this.coord)) return false;
        return o.end.equals(this.end);
    }
    public toString(): string {
        if (this === KamisadoMove.PASS) {
            return 'KamisadoMove(PASS)';
        }
        return 'KamisadoMove(' + this.coord + '->' + this.end + ')';
    }
}
