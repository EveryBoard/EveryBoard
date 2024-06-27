import { Ordinal } from './Ordinal';
import { Direction, DirectionFactory } from './Direction';
import { Encoder, JSONValue, MGPFallible, Utils } from '@everyboard/lib';

export class Orthogonal extends Direction {

    public static readonly UP: Orthogonal = new Orthogonal(0, -1);
    public static readonly RIGHT: Orthogonal = new Orthogonal(1, 0);
    public static readonly DOWN: Orthogonal = new Orthogonal(0, 1);
    public static readonly LEFT: Orthogonal = new Orthogonal(-1, 0);

    public static readonly factory: DirectionFactory<Orthogonal> = new class extends DirectionFactory<Orthogonal> {
        public all: ReadonlyArray<Orthogonal> = [
            Orthogonal.RIGHT,
            Orthogonal.DOWN,
            Orthogonal.LEFT,
            Orthogonal.UP,
        ];
    };
    public static readonly ORTHOGONALS: ReadonlyArray<Orthogonal> = Orthogonal.factory.all;

    public static readonly encoder: Encoder<Orthogonal> = Encoder.fromFunctions(
        (dir: Orthogonal): string => {
            return dir.toString();
        },
        (encoded: JSONValue): Orthogonal => {
            Utils.assert(typeof encoded === 'string', 'Invalid encoded orthogonal');
            const fromString: MGPFallible<Orthogonal> = Orthogonal.factory.fromString(encoded as string);
            return fromString.get();
        },
    );

    public override getOpposite(): this {
        const opposite: MGPFallible<Orthogonal> = Orthogonal.factory.from(-this.x, -this.y);
        return opposite.get() as this;
    }

    public rotateClockwise(): Orthogonal {
        const rotated: MGPFallible<Orthogonal> = Orthogonal.factory.from(-this.y, this.x);
        return rotated.get();
    }

    public toOrdinal(): Direction {
        switch (this) {
            case Orthogonal.UP: return Ordinal.UP;
            case Orthogonal.RIGHT: return Ordinal.RIGHT;
            case Orthogonal.DOWN: return Ordinal.DOWN;
            default:
                Utils.expectToBe(this, Orthogonal.LEFT);
                return Ordinal.LEFT;
        }
    }

    public getAngle(): number {
        return this.toOrdinal().getAngle();
    }

}
