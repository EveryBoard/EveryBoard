import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaPartSlice } from './SaharaPartSlice';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { NumberEncoder } from 'src/app/jscaip/Encoder';

export class SaharaMove extends MoveCoordToCoord {
    public static encoder: NumberEncoder<SaharaMove> = new class extends NumberEncoder<SaharaMove> {
        public maxValue(): number {
            return (6*11*6*SaharaPartSlice.WIDTH) + (11*6*SaharaPartSlice.HEIGHT) +
                (6*SaharaPartSlice.WIDTH) + SaharaPartSlice.HEIGHT;
        }
        public encodeNumber(move: SaharaMove): number {
            const ey: number = move.end.y;
            const ex: number = move.end.x;
            const sy: number = move.coord.y;
            const sx: number = move.coord.x;
            return (6*11*6*sx) + (11*6*sy) + (6*ex) + ey;
        }
        public decodeNumber(encodedMove: number): SaharaMove {
            const ey: number = encodedMove%6;
            encodedMove -= ey;
            encodedMove /= 6;
            const ex: number = encodedMove%11;
            encodedMove -= ex;
            encodedMove /=11;
            const sy: number = encodedMove%6;
            encodedMove -= sy;
            encodedMove /= 6;
            const sx: number = encodedMove;
            return new SaharaMove(new Coord(sx, sy), new Coord(ex, ey));
        }
    }
    public static checkDistanceAndLocation(start: Coord, end: Coord): void {
        const dx: number = Math.abs(start.x - end.x);
        const dy: number = Math.abs(start.y - end.y);
        const distance: number = dx+dy;
        if (distance === 1) {
            const fakeNeighboors: Coord = TriangularCheckerBoard.getFakeNeighboors(start);
            if (end.equals(fakeNeighboors)) {
                throw new Error(start.toString() + ' and ' + end.toString() + ' are not neighboors.');
            }
        } else if (distance === 2) {
            if ((start.x + start.y) % 2 === 0) {
                throw new Error('Can only bounce twice when started on a white triangle.');
            }
            if (start.x === end.x) {
                throw new Error(start.toString() + ' and ' + end.toString() + ' have no intermediary neighboors.');
            }
        } else {
            throw new Error('Vous pouvez vous déplacer maximum de 2 cases, pas de ' + distance + '.');
        }
    }
    constructor(start: Coord, end: Coord) {
        super(start, end);
        if (!start.isInRange(SaharaPartSlice.WIDTH, SaharaPartSlice.HEIGHT)) {
            throw new Error('Move must start inside the board not at '+start.toString() + '.');
        }
        if (!end.isInRange(SaharaPartSlice.WIDTH, SaharaPartSlice.HEIGHT)) {
            throw new Error('Move must end inside the board not at '+end.toString() + '.');
        }
        SaharaMove.checkDistanceAndLocation(start, end);
    }
    public equals(o: SaharaMove): boolean {
        if (o === this) return true;
        if (!o.coord.equals(this.coord)) return false;
        return o.end.equals(this.end);
    }
    public toString(): string {
        return 'SaharaMove(' + this.coord + '->' + this.end + ')';
    }
}
