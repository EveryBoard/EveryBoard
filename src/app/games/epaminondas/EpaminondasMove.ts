import { Direction } from 'src/app/jscaip/Direction';
import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MGPCanFail } from 'src/app/utils/MGPCanFail';
import { assert } from 'src/app/utils/utils';

export class EpaminondasMove extends MoveCoord {
    public static encoder: NumberEncoder<EpaminondasMove> = new class extends NumberEncoder<EpaminondasMove> {
        public maxValue(): number {
            const direction: number = 7;
            const stepSize: number = 6;
            const movedPieces: number = 12;
            const cy: number = 11;
            const cx: number = 13;
            return (cx * 8 * 7 * 13 * 12) + (cy * 8 * 7 * 13) + (movedPieces * 8 * 7) + (stepSize * 8) + direction;
        }
        public encodeNumber(move: EpaminondasMove): number {
            const direction: number = move.direction.toInt(); // Between 0 and 7
            const stepSize: number = move.stepSize - 1; // Between 1 and 7 => between 0 and 6
            const movedPieces: number = move.movedPieces -1; // Between 1 and 13 => between 0 and 12

            const cy: number = move.coord.y; // Between 0 and 11
            const cx: number = move.coord.x; // Between 0 and 13
            return (cx * 8 * 7 * 13 * 12) + (cy * 8 * 7 * 13) + (movedPieces * 8 * 7) + (stepSize * 8) + direction;
        }
        public decodeNumber(encodedMove: number): EpaminondasMove {
            // encoded as such : cx; cy; movedPiece; stepSize; direction
            if (encodedMove % 1 !== 0) throw new Error('EncodedMove must be an integer.');

            const directionNumber: number = encodedMove % 8;
            encodedMove -= directionNumber;
            encodedMove /= 8;

            const stepSize: number = encodedMove % 7;
            encodedMove -= stepSize;
            encodedMove /= 7;

            const movedPieces: number = encodedMove % 13;
            encodedMove -= movedPieces;
            encodedMove /= 13;

            const cy: number = encodedMove % 12;
            encodedMove -= cy;
            encodedMove /= 12;

            const cx: number = encodedMove;

            const direction: MGPCanFail<Direction> = Direction.factory.fromInt(directionNumber);
            assert(direction.isSuccess(), 'Invalid encoded direction');
            return new EpaminondasMove(cx, cy, movedPieces + 1, stepSize + 1, direction.get());
        }
    }
    public constructor(x: number,
                       y: number,
                       public readonly movedPieces: number,
                       public readonly stepSize: number,
                       public readonly direction: Direction)
    {
        super(x, y);
        if (this.coord.isNotInRange(14, 12)) {
            throw new Error('Illegal coord outside of board ' + this.coord.toString() + '.');
        }
        if (movedPieces == null) {
            throw new Error('Number of moved pieces cannot be null.');
        }
        if (movedPieces < 1) {
            throw new Error('Must select minimum one piece (got ' + movedPieces + ').');
        }
        if (stepSize == null) {
            throw new Error('Step size cannot be null.');
        }
        if (stepSize < 1) {
            throw new Error('Step size must be minimum one (got ' + stepSize + ').');
        }
        if (stepSize > movedPieces) {
            throw new Error('Cannot move a phalanx further than its size (got step size ' + stepSize + ' for ' + movedPieces+ ' pieces).');
        }
        if (direction == null) {
            throw new Error('Direction cannot be null.');
        }
    }
    public toString(): string {
        return 'EpaminondasMove(' + this.coord.toString() + ', m:' +
                                  this.movedPieces + ', s:' +
                                  this.stepSize + ', ' +
                                  this.direction.toString() + ')';
    }
    public equals(o: EpaminondasMove): boolean {
        if (this === o) return true;
        if (!this.coord.equals(o.coord)) return false;
        if (this.movedPieces !== o.movedPieces) return false;
        if (this.stepSize !== o.stepSize) return false;
        return this.direction.equals(o.direction);
    }
}
