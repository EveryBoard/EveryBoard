import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Encoder } from 'src/app/utils/Encoder';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';

type AbaloneMoveFields = [Coord, HexaDirection, MGPOptional<Coord>];

export class AbaloneMove extends MoveCoord {

    public static encoder: Encoder<AbaloneMove> = Encoder.tuple(
        [Coord.encoder, HexaDirection.encoder, MGPOptional.getEncoder(Coord.encoder)],
        (m: AbaloneMove): AbaloneMoveFields => [m.coord, m.dir, m.lastPiece],
        (fields: AbaloneMoveFields): AbaloneMove => new AbaloneMove(fields[0], fields[1], fields[2]));

    public static fromSingleCoord(coord: Coord, dir: HexaDirection): MGPFallible<AbaloneMove> {
        if (coord.isInRange(9, 9)) {
            return MGPFallible.success(new AbaloneMove(coord, dir, MGPOptional.empty()));
        } else {
            return MGPFallible.failure('Coord ' + coord.toString() + ' out of range, invalid move!');
        }
    }
    public static fromDoubleCoord(first: Coord, second: Coord, dir: HexaDirection): MGPFallible<AbaloneMove> {
        const coords: Coord[] = [first, second];
        ArrayUtils.sortByDescending(coords, AbaloneMove.sortCoord);
        const direction: Direction = coords[1].getDirectionToward(coords[0]).get();
        const hexaDirectionOptional: MGPFallible<HexaDirection> =
            HexaDirection.factory.fromDelta(direction.x, direction.y);
        if (hexaDirectionOptional.isFailure()) {
            return MGPFallible.failure('Invalid direction');
        }
        const hexaDirection: HexaDirection = hexaDirectionOptional.get();
        const distance: number = coords[1].getDistance(coords[0]);
        if (distance > 2) {
            return MGPFallible.failure('Distance between first coord and last coord is too big');
        }
        if (hexaDirection.equals(dir)) {
            return AbaloneMove.fromSingleCoord(coords[1], dir);
        } else if (hexaDirection.getOpposite().equals(dir)) {
            return AbaloneMove.fromSingleCoord(coords[0], dir);
        }
        return MGPFallible.success(new AbaloneMove(coords[1], dir, MGPOptional.of(coords[0])));
    }
    public static sortCoord(coord: Coord): number {
        return coord.y * 9 + coord.x;
    }
    private constructor(coord: Coord,
                        public dir: HexaDirection,
                        public lastPiece: MGPOptional<Coord>)
    {
        super(coord.x, coord.y);
    }
    public toString(): string {
        if (this.isSingleCoord()) {
            return 'AbaloneMove(' + this.coord.x + ', ' + this.coord.y + ', ' + this.dir.toString() + ')';
        } else {
            return 'AbaloneMove(' + this.coord.toString() + ' > ' + this.lastPiece.get().toString() + ', ' + this.dir.toString() + ')';
        }
    }
    public isSingleCoord(): boolean {
        return this.lastPiece.isAbsent();
    }
    public override equals(other: AbaloneMove): boolean {
        return other.coord.equals(this.coord) &&
               other.dir.equals(this.dir) &&
               other.lastPiece.equals(this.lastPiece);
    }
}
