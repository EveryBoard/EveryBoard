import { Coord } from 'src/app/jscaip/coord/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { TablutRules } from '../tablut-rules/TablutRules';
import { TablutRulesConfig } from '../tablut-rules/TablutRulesConfig';
import { Direction } from 'src/app/jscaip/DIRECTION';

export class TablutMove extends MoveCoordToCoord {
    public static encode(move: TablutMove): number {
        // encoded as (binarywise) A(x, y) -> B(X, Y)
        // all value are between 0 and 8, so encoded on four bits
        // dxdx dydy axax ayay
        const dx: number = move.coord.x;
        const dy: number = move.coord.y;
        const ax: number = move.end.x;
        const ay: number = move.end.y;
        return (dx * 4096) + (dy * 256) + (ax * 16) + ay;
    }
    public static decode(encodedMove: number): TablutMove {
        // encoded as such : dx; dy; ax; ay
        const ay = encodedMove % 16;
        encodedMove = encodedMove / 16;
        encodedMove -= encodedMove % 1;
        const ax = encodedMove % 16;
        const arrive: Coord = new Coord(ax, ay);
        encodedMove = encodedMove / 16;
        encodedMove -= encodedMove % 1;
        const dy = encodedMove % 16;
        encodedMove = encodedMove / 16;
        encodedMove -= encodedMove % 1;
        const dx = encodedMove % 16;
        const depart: Coord = new Coord(dx, dy);
        return new TablutMove(depart, arrive);
    }
    public constructor(start: Coord, end: Coord) {
        super(start, end);
        if (!start.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH)) { // TODO: put that somewhere it does not say "mutual import"
            throw new Error('Starting coord of TablutMove must be on the board, not at ' + start.toString() + '.');
        }
        if (!end.isInRange(TablutRulesConfig.WIDTH, TablutRulesConfig.WIDTH)) { // TODO: put that somewhere it does not say "mutual import"
            throw new Error('Starting coord of TablutMove must be on the board, not at ' + end.toString() + '.');
        }
        const dir: Direction = start.getDirectionToward(end);
        if (dir.isDiagonal()) {
            throw new Error('TablutMove cannot be diagonal.');
        }
    }
    public equals(o: any): boolean {
        if (o === this) return true;
        if (!(o instanceof TablutMove)) return false;
        const other: TablutMove = o as TablutMove;
        if (!other.coord.equals(this.coord)) return false;
        return (other.end.equals(this.end));
    }
    public toString(): string {
        return 'TablutMove(' + this.coord + '->' + this.end + ')';
    }
    public encode(): number {
        return TablutMove.encode(this);
    }
    public decode(encodedMove: number): TablutMove {
        return TablutMove.decode(encodedMove);
    }
}
