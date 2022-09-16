import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { NumberEncoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class SiamMove extends MoveCoord {
    public static encoder: NumberEncoder<SiamMove> = new class extends NumberEncoder<SiamMove> {
        public maxValue(): number {
            return 245 * 8 + 49 * 8 + 7 * 7 + 7;
        }
        public encodeNumber(move: SiamMove): number {
            const y: number = move.coord.y + 1; // 0 to 6
            const x: number = move.coord.x + 1; // 0 to 6
            const direction: number = move.direction.isAbsent() ? 4 : move.direction.get().toInt(); // 0 to 4
            const landingOrientation: number = move.landingOrientation.toInt();
            return (245 * landingOrientation) + (49 * direction) + (7 * x) + y;
        }
        public decodeNumber(encodedMove: number): SiamMove {
            const y: number = encodedMove%7;
            encodedMove -= y;
            encodedMove/= 7;
            const x: number = encodedMove%7;
            encodedMove -= x;
            encodedMove/= 7;
            const moveDirectionInt: number = encodedMove % 5;
            const moveDirection: MGPOptional<Orthogonal> = moveDirectionInt === 4 ?
                MGPOptional.empty() :
                Orthogonal.factory.fromInt(moveDirectionInt).toOptional();
            encodedMove -= moveDirectionInt;
            encodedMove /= 5;
            const landingOrientation: Orthogonal = Orthogonal.factory.fromInt(encodedMove).get();
            return new SiamMove(x - 1, y - 1, moveDirection, landingOrientation);
        }
    };
    private constructor(
        readonly x: number,
        readonly y: number,
        public readonly direction: MGPOptional<Orthogonal>,
        public readonly landingOrientation: Orthogonal) {
        super(x, y);
    }
    public static of(x: number,
                     y: number,
                     direction: MGPOptional<Orthogonal>,
                     landingOrientation: Orthogonal)
    : MGPFallible<SiamMove>
    {
        const move: SiamMove = new SiamMove(x, y, direction, landingOrientation);
        const startedOutside: boolean = move.coord.isNotInRange(5, 5);
        if (move.direction.isAbsent()) {
            if (startedOutside) {
                return MGPFallible.failure('Cannot rotate piece outside the board: ' + move.toString());
            }
        } else {
            const finishedOutside: boolean = move.coord.getNext(move.direction.get()).isNotInRange(5, 5);
            if (finishedOutside) {
                if (startedOutside) {
                    return MGPFallible.failure('SiamMove should end or start on the board: ' + move.toString());
                }
                if (move.direction.get() !== move.landingOrientation) {
                    return MGPFallible.failure('SiamMove should have moveDirection and landingOrientation matching when a piece goes out of the board: ' + move.toString());
                }
            }
        }
        return MGPFallible.success(move);
    }
    public isRotation(): boolean {
        return this.direction.isAbsent();
    }
    public equals(other: SiamMove): boolean {
        if (this === other) return true;
        if (!this.coord.equals(other.coord)) return false;
        if (this.direction.equals(other.direction) === false) return false;
        return this.landingOrientation === other.landingOrientation;
    }
    public toString(): string {
        const moveDirection: string = this.direction.isAbsent() ? '-' : this.direction.get().toString();
        return 'SiamMove(' + this.coord.x + ', ' +
                           this.coord.y + ', ' +
                           moveDirection + ', ' +
                           this.landingOrientation + ')';
    }
    public isInsertion(): boolean {
        return this.coord.x === -1 ||
               this.coord.x === +5 ||
               this.coord.y === -1 ||
               this.coord.y === +5;
    }
}
