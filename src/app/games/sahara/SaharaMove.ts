import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { Coord } from 'src/app/jscaip/Coord';
import { SaharaState } from './SaharaState';
import { TriangularCheckerBoard } from 'src/app/jscaip/TriangularCheckerBoard';
import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { SaharaFailure } from './SaharaFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

export class SaharaMove extends MoveCoordToCoord {
    public static encoder: NumberEncoder<SaharaMove> = new class extends NumberEncoder<SaharaMove> {
        public maxValue(): number {
            return (6*11*6*SaharaState.WIDTH) + (11*6*SaharaState.HEIGHT) +
                (6*SaharaState.WIDTH) + SaharaState.HEIGHT;
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
            return SaharaMove.from(new Coord(sx, sy), new Coord(ex, ey)).get();
        }
    }
    public static checkDistanceAndLocation(start: Coord, end: Coord): MGPValidation {
        const dx: number = Math.abs(start.x - end.x);
        const dy: number = Math.abs(start.y - end.y);
        const distance: number = dx+dy;
        if (distance === 0) {
            return MGPValidation.failure(RulesFailure.MOVE_CANNOT_BE_STATIC());
        } else if (distance === 1) {
            const fakeNeighbors: Coord = TriangularCheckerBoard.getFakeNeighbors(start);
            if (end.equals(fakeNeighbors)) {
                return MGPValidation.failure(SaharaFailure.THOSE_TWO_SPACES_ARE_NOT_NEIGHBORS());
            }
        } else if (distance === 2) {
            if ((start.x + start.y) % 2 === 0) {
                return MGPValidation.failure(SaharaFailure.CAN_ONLY_REBOUND_ON_BLACK());
            }
            if (start.x === end.x) {
                return MGPValidation.failure(SaharaFailure.THOSE_TWO_SPACES_HAVE_NO_COMMON_NEIGHBOR());
            }
        } else {
            return MGPValidation.failure($localize`You can move one or two spaces, not ${distance}.`);
        }
        return MGPValidation.SUCCESS;
    }
    public static from(start: Coord, end: Coord): MGPFallible<SaharaMove> {
        if (!start.isInRange(SaharaState.WIDTH, SaharaState.HEIGHT)) {
            throw new Error('Move must start inside the board not at ' + start.toString() + '.');
        }
        if (!end.isInRange(SaharaState.WIDTH, SaharaState.HEIGHT)) {
            throw new Error('Move must end inside the board not at ' + end.toString() + '.');
        }
        const validity: MGPValidation = SaharaMove.checkDistanceAndLocation(start, end);
        if (validity.isFailure()) {
            return validity.toFailedFallible();
        } else {
            return MGPFallible.success(new SaharaMove(start, end));
        }
    }
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public isSimpleStep(): boolean {
        const dx: number = Math.abs(this.coord.x - this.end.x);
        const dy: number = Math.abs(this.coord.y - this.end.y);
        return dx + dy === 1;
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
