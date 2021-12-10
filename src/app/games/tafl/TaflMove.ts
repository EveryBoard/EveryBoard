import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Direction } from 'src/app/jscaip/Direction';
import { NumberEncoder } from 'src/app/jscaip/Encoder';

export class TaflEncoder<M extends TaflMove> extends NumberEncoder<M> {

    constructor(private readonly MAX: number,
                private readonly of: (start: Coord, end: Coord) => M) {
        super();
    }
    public maxValue(): number {
        const biggestMove: number = this.MAX - 1;
        return (biggestMove * this.MAX * this.MAX * this.MAX) +
               (biggestMove * this.MAX * this.MAX) +
               (biggestMove * this.MAX) +
               biggestMove;
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
        return this.of(start, end);
    }
}

export abstract class TaflMove extends MoveCoordToCoord {

    protected constructor(start: Coord, end: Coord) {
        super(start, end);
        if (start.isNotInRange(this.getMaximalDistance(), this.getMaximalDistance())) {
            throw new Error('Starting coord of TaflMove must be on the board, not at ' + start.toString() + '.');
        }
        if (end.isNotInRange(this.getMaximalDistance(), this.getMaximalDistance())) {
            throw new Error('Landing coord of TaflMove must be on the board, not at ' + end.toString() + '.');
        }
        const dir: Direction = start.getDirectionToward(end).get();
        if (dir.isDiagonal()) {
            throw new Error('TaflMove cannot be diagonal.');
        }
    }
    public equals(o: TaflMove): boolean {
        if (o === this) return true;
        if (o.coord.equals(this.coord) === false) return false;
        return o.end.equals(this.end);
    }
    public toString(): string {
        return 'TaflMove(' + this.coord + '->' + this.end + ')';
    }
    public abstract getMaximalDistance(): number;
}
