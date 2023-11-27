import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { Encoder } from '@everyboard/lib';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MGPValidation } from '@everyboard/lib';
import { QuixoFailure } from './QuixoFailure';
import { QuixoState } from './QuixoState';

export class QuixoMove extends MoveCoord {

    public static encoder: Encoder<QuixoMove> = Encoder.tuple(
        [Coord.encoder, Orthogonal.encoder],
        (m: QuixoMove): [Coord, Orthogonal] => [m.coord, m.direction],
        (fields: [Coord, Orthogonal]): QuixoMove => new QuixoMove(fields[0].x, fields[0].y, fields[1]));

    public static isValidCoord(coord: Coord): MGPValidation {
        if (QuixoState.isOnBoard(coord) === false) {
            return MGPValidation.failure('Invalid coord for QuixoMove: ' + coord.toString() + ' is outside the board.');
        }
        if (coord.x !== 0 && coord.x !== (QuixoState.SIZE - 1) && coord.y !== 0 && coord.y !== (QuixoState.SIZE - 1)) {
            return MGPValidation.failure(QuixoFailure.NO_INSIDE_CLICK());
        }
        return MGPValidation.SUCCESS;
    }
    public constructor(x: number, y: number, public readonly direction: Orthogonal) {
        super(x, y);
        const coordValidity: MGPValidation = QuixoMove.isValidCoord(this.coord);
        if (coordValidity.isFailure()) throw new Error(coordValidity.getReason());
        if (x === 0 && direction === Orthogonal.LEFT) {
            throw new Error(`Invalid direction: pawn on the left side can't be moved to the left.`);
        }
        if (x === (QuixoState.SIZE - 1) && direction === Orthogonal.RIGHT) {
            throw new Error(`Invalid direction: pawn on the right side can't be moved to the right.`);
        }
        if (y === 0 && direction === Orthogonal.UP) {
            throw new Error(`Invalid direction: pawn on the top side can't be moved up.`);
        }
        if (y === (QuixoState.SIZE - 1) && direction === Orthogonal.DOWN) {
            throw new Error(`Invalid direction: pawn on the bottom side can't be moved down.`);
        }
    }
    public toString(): string {
        return 'QuixoMove(' + this.coord.x + ', ' + this.coord.y + ', ' + this.direction.toString() + ')';
    }
    public override equals(other: QuixoMove): boolean {
        if (other === this) return true;
        if (other.coord.equals(this.coord) === false) return false;
        return other.direction === this.direction;
    }
}
