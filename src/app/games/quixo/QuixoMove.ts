import { Coord } from 'src/app/jscaip/coord/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { QuixoFailure } from './QuixoFailure';

export class QuixoMove extends MoveCoord {
    public static isValidCoord(coord: Coord): MGPValidation {
        if (coord.isNotInRange(5, 5)) {
            return MGPValidation.failure('Invalid coord for QuixoMove: ' + coord.toString() + ' is outside the board.');
        }
        if (coord.x !== 0 && coord.x !== 4 && coord.y !== 0 && coord.y !== 4) {
            return MGPValidation.failure(QuixoFailure.NO_INSIDE_CLICK);
        }
        return MGPValidation.SUCCESS;
    }
    public static encode(move: QuixoMove): number {
        return move.encode();
    }
    public static decode(encodedMove: number): QuixoMove {
        const direction: Orthogonal = Orthogonal.factory.fromInt(encodedMove % 4);
        encodedMove -= encodedMove % 4; encodedMove /= 4;
        const y: number = encodedMove % 5;
        encodedMove -= encodedMove % 5; encodedMove /= 5;
        return new QuixoMove(encodedMove, y, direction);
    }
    constructor(x: number, y: number, public readonly direction: Orthogonal) {
        super(x, y);
        const coordValidity: MGPValidation = QuixoMove.isValidCoord(this.coord);
        if (coordValidity.isFailure()) throw new Error(coordValidity.reason);
        if (direction == null) throw new Error('Direction cannot be null.');
        if (x === 0 && direction === Orthogonal.LEFT) {
            throw new Error('Invalid direction: pawn on the left side can\'t be moved to the left.');
        }
        if (x === 4 && direction === Orthogonal.RIGHT) {
            throw new Error('Invalid direction: pawn on the right side can\'t be moved to the right.');
        }
        if (y === 0 && direction === Orthogonal.UP) {
            throw new Error('Invalid direction: pawn on the top side can\'t be moved up.');
        }
        if (y === 4 && direction === Orthogonal.DOWN) {
            throw new Error('Invalid direction: pawn on the bottom side can\'t be moved down.');
        }
    }
    public toString(): string {
        return 'QuixoMove(' + this.coord.x + ', ' + this.coord.y + ', ' + this.direction.toString() + ')';
    }
    public equals(o: QuixoMove): boolean {
        if (o === this) return true;
        if (!o.coord.equals(this.coord)) return false;
        return o.direction === this.direction;
    }
    public encode(): number {
        const dir: number = this.direction.toInt();
        const y: number = this.coord.y * 4;
        const x: number = this.coord.x * 20;
        return x + y + dir;
    }
    public decode(encodedMove: number): QuixoMove {
        return QuixoMove.decode(encodedMove);
    }
}
