import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class AbaloneMove extends MoveCoord {

    public static encoder: NumberEncoder<AbaloneMove> = new class extends NumberEncoder<AbaloneMove> {
        public maxValue(): number {
            return (8*9*2*9*9*8 + 8*2*9*9*8 + 9*9*8) + (8*9*6 + 8*8) + 7;
        }
        public encodeNumber(move: AbaloneMove): number {
            const base: number = (move.coord.x * 9 * 8) + (move.coord.y * 8) + move.dir.toInt();
            if (move.isSingleCoord()) {
                return base;
            } else {
                const lastPiece: Coord = move.lastPiece.get();
                return (lastPiece.x * 9 * 2 * 9 * 9 * 8) + (lastPiece.y * 2 * 9 * 9 * 8) + (9 * 9 * 8) + base;
            }
        }
        public decodeNumber(encodedMove: number): AbaloneMove {
            const dir: number = encodedMove % 8;
            encodedMove = (encodedMove - dir) / 8;
            const directionOptional: MGPFallible<HexaDirection> = HexaDirection.factory.fromInt(dir);
            const direction: HexaDirection = directionOptional.get();

            const y: number = encodedMove % 9;
            encodedMove = (encodedMove - y) / 9;

            const x: number = encodedMove % 9;
            encodedMove = (encodedMove - x) / 9;

            const first: Coord = new Coord(x, y);
            if (encodedMove === 0) {
                const moveOptional: MGPFallible<AbaloneMove> = AbaloneMove.fromSingleCoord(first, direction);
                return moveOptional.get();
            } else {
                encodedMove = (encodedMove - 1) / 2;

                const ly: number = encodedMove % 9;
                encodedMove = (encodedMove - ly) / 9;

                const lx: number = encodedMove % 9;
                encodedMove = (encodedMove - lx) / 9;

                const last: Coord = new Coord(lx, ly);

                const moveOptional: MGPFallible<AbaloneMove> = AbaloneMove.fromDoubleCoord(first, last, direction);
                return moveOptional.get();
            }
        }
    }
    public static fromSingleCoord(coord: Coord, dir: HexaDirection): MGPFallible<AbaloneMove> {
        try {
            return MGPFallible.success(new AbaloneMove(coord, dir, MGPOptional.empty()));
        } catch (e) {
            return MGPFallible.failure(e.message);
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
            return MGPFallible.failure('Distance between first coord and last coord is too great');
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
        if (coord.isNotInRange(9, 9)) {
            throw new Error('Coord ' + coord.toString() + ' out of range, invalid move!');
        }
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
    public equals(o: AbaloneMove): boolean {
        return o.coord.equals(this.coord) &&
               o.dir.equals(this.dir) &&
               o.lastPiece.equals(this.lastPiece);
    }
}
