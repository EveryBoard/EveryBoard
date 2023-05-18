import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Orthogonal, OrthogonalNumberEncoder } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';

type SiamMoveFields = [number, number, MGPOptional<Orthogonal>, Orthogonal];

export class SiamMove extends MoveCoord {
    public static encoder: MoveEncoder<SiamMove> = MoveEncoder.tuple(
        [
            MoveEncoder.identity<number>(), // x
            MoveEncoder.identity<number>(), // y
            MGPOptional.getEncoder(Orthogonal.encoder), // direction
            Orthogonal.encoder, // orientation
        ],
        (m: SiamMove): SiamMoveFields => [m.x, m.y, m.direction, m.landingOrientation],
        (fields: SiamMoveFields): SiamMove => SiamMove.of(fields[0], fields[1], fields[2], fields[3]).get());

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
