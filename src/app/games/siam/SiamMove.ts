import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Orthogonal, OrthogonalNumberEncoder } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { NumberEncoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class SiamMove extends MoveCoord {
    public static encoder: NumberEncoder<SiamMove> = NumberEncoder.tuple(
        [
            NumberEncoder.numberEncoder(6), // x (from -1 to 5)
            NumberEncoder.numberEncoder(6), // y (from -1 to 5)
            MGPOptional.getNumberEncoder<Orthogonal>(new OrthogonalNumberEncoder()), // direction
            new OrthogonalNumberEncoder(), // orientation
        ],
        (move: SiamMove): [number, number, MGPOptional<Orthogonal>, Orthogonal] => {
            return [move.x + 1, move.y + 1, move.direction, move.landingOrientation];
        },
        (fields: [number, number, MGPOptional<Orthogonal>, Orthogonal]): SiamMove => {
            return SiamMove.of(fields[0]-1, fields[1]-1, fields[2], fields[3]).get();
        },
    );

    private constructor(
        readonly x: number,
        readonly y: number,
        public readonly direction: MGPOptional<Orthogonal>,
        public readonly landingOrientation: Orthogonal)
    {
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
        if (move.isRotation()) {
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
