import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Direction } from 'src/app/jscaip/Direction';
import { NumberEncoder } from 'src/app/jscaip/Encoder';

export class TaflEncoder<M extends TaflMove> extends NumberEncoder<M> {

    constructor(public readonly MAX: number,
                public readonly instanceProdider: (start: Coord, end: Coord) => M) {
        super();
    }
    public maxValue(): number {
        const bigDigit: number = this.MAX - 1;
        return (bigDigit * this.MAX * this.MAX * this.MAX) +
               (bigDigit * this.MAX * this.MAX) +
               (bigDigit * this.MAX) +
               bigDigit;
    }
    public encodeNumber(move: TaflMove): number {
        // encoded as (binarywise) A(x, y) -> B(X, Y)
        // all value are between 0 and MAX, encoded
        const dx: number = move.coord.x;
        const dy: number = move.coord.y;
        const ax: number = move.end.x;
        const ay: number = move.end.y;
        return (dx * this.MAX * this.MAX * this.MAX) +
               (dy * this.MAX * this.MAX) +
               (ax * this.MAX) +
               ay;
    }
    public decodeNumber(encodedMove: number): M {
        // encoded as such : dx; dy; ax; ay
        const ay: number = encodedMove % this.MAX;
        encodedMove = encodedMove / this.MAX;
        encodedMove -= encodedMove % 1;
        const ax: number = encodedMove % this.MAX;
        const end: Coord = new Coord(ax, ay);
        encodedMove = encodedMove / this.MAX;
        encodedMove -= encodedMove % 1;
        const dy: number = encodedMove % this.MAX;
        encodedMove = encodedMove / this.MAX;
        encodedMove -= encodedMove % 1;
        const dx: number = encodedMove % this.MAX;
        const start: Coord = new Coord(dx, dy);
        return this.instanceProdider(start, end);
    }
}

export class TaflMove extends MoveCoordToCoord {

    public constructor(start: Coord, end: Coord) {
        super(start, end);
        if (start.isNotInRange(this.getWidth(), this.getWidth())) {
            throw new Error('Starting coord of TaflMove must be on the board, not at ' + start.toString() + '.');
        }
        if (end.isNotInRange(this.getWidth(), this.getWidth())) {
            throw new Error('Landing coord of TaflMove must be on the board, not at ' + end.toString() + '.');
        }
        const dir: Direction = start.getDirectionToward(end).get();
        if (dir.isDiagonal()) {
            throw new Error('TaflMove cannot be diagonal.');
        }
    }
    public equals(o: TaflMove): boolean {
        if (o === this) return true;
        if (!o.coord.equals(this.coord)) return false;
        return o.end.equals(this.end);
    }
    public toString(): string {
        return 'TaflMove(' + this.coord + '->' + this.end + ')';
    }
    public getWidth(): number {
        throw new Error('TaflMove.getWidth should be implemented on concrete TaflMove Children!');
    }
}
