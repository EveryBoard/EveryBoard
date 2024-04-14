import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { Orthogonal } from 'src/app/jscaip/Orthogonal';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Encoder } from 'src/app/utils/Encoder';

type SiamMoveFields = [number, number, MGPOptional<Orthogonal>, Orthogonal];

export class SiamMove extends MoveCoord {

    public static encoder: Encoder<SiamMove> = Encoder.tuple(
        [
            Encoder.identity<number>(), // x
            Encoder.identity<number>(), // y
            MGPOptional.getEncoder(Orthogonal.encoder), // direction
            Orthogonal.encoder, // orientation
        ],
        (m: SiamMove): SiamMoveFields => [m.x, m.y, m.direction, m.landingOrientation],
        (fields: SiamMoveFields): SiamMove => SiamMove.of(fields[0], fields[1], fields[2], fields[3]));

    private constructor(readonly x: number,
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
    : SiamMove
    {
        return new SiamMove(x, y, direction, landingOrientation);
    }
    public isRotation(): boolean {
        return this.direction.isAbsent();
    }
    public override equals(other: SiamMove): boolean {
        if (this === other) return true;
        if (this.coord.equals(other.coord) === false) return false;
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
}
