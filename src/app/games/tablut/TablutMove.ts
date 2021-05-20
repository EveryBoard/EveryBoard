import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { TablutRulesConfig } from './TablutRulesConfig';
import { Direction } from 'src/app/jscaip/Direction';
import { NumberEncoder } from 'src/app/jscaip/Encoder';

export class TablutMove extends MoveCoordToCoord {
    public static encoder: NumberEncoder<TablutMove> = new class extends NumberEncoder<TablutMove> {
        public maxValue(): number {
            return 8*4096 + 8*256 + 8*16 + 8;
        }
        public encodeNumber(move: TablutMove): number {
            // encoded as (binarywise) A(x, y) -> B(X, Y)
            // all value are between 0 and 8, so encoded on four bits
            // dxdx dydy axax ayay
            const dx: number = move.coord.x;
            const dy: number = move.coord.y;
            const ax: number = move.end.x;
            const ay: number = move.end.y;
            return (dx * 4096) + (dy * 256) + (ax * 16) + ay;
        }
        public decodeNumber(encodedMove: number): TablutMove {
            // encoded as such : dx; dy; ax; ay
            const ay: number = encodedMove % 16;
            encodedMove = encodedMove / 16;
            encodedMove -= encodedMove % 1;
            const ax: number = encodedMove % 16;
            const arrive: Coord = new Coord(ax, ay);
            encodedMove = encodedMove / 16;
            encodedMove -= encodedMove % 1;
            const dy: number = encodedMove % 16;
            encodedMove = encodedMove / 16;
            encodedMove -= encodedMove % 1;
            const dx: number = encodedMove % 16;
            const depart: Coord = new Coord(dx, dy);
            return new TablutMove(depart, arrive);
        }
    }
    public constructor(start: Coord, end: Coord) {
        super(start, end);
        if (!start.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH)) {
            throw new Error('Starting coord of TablutMove must be on the board, not at ' + start.toString() + '.');
        }
        if (!end.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH)) {
            throw new Error('Landing coord of TablutMove must be on the board, not at ' + end.toString() + '.');
        }
        const dir: Direction = start.getDirectionToward(end);
        if (dir.isDiagonal()) {
            throw new Error('TablutMove cannot be diagonal.');
        }
    }
    public equals(o: TablutMove): boolean {
        if (o === this) return true;
        if (!o.coord.equals(this.coord)) return false;
        return o.end.equals(this.end);
    }
    public toString(): string {
        return 'TablutMove(' + this.coord + '->' + this.end + ')';
    }
}
