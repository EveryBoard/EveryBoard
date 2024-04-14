import { JSONValue, Utils } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';
import { MGPFallible } from '../utils/MGPFallible';
import { Encoder } from '../utils/Encoder';
import { Ordinal } from './Ordinal';
import { Direction, DirectionFactory } from './Direction';


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

        public override from(x: number, y: number): MGPFallible<Orthogonal> {
            if (x === 0 && y === -1) return MGPFallible.success(Orthogonal.UP);
            if (x === 1 && y === 0) return MGPFallible.success(Orthogonal.RIGHT);
            if (x === 0 && y === 1) return MGPFallible.success(Orthogonal.DOWN);
            if (x === -1 && y === 0) return MGPFallible.success(Orthogonal.LEFT);
            return MGPFallible.failure('Invalid orthogonal from x and y');
        }
    };
    public static readonly ORTHOGONALS: ReadonlyArray<Orthogonal> = Orthogonal.factory.all;

    public static readonly encoder: Encoder<Orthogonal> = Encoder.fromFunctions(
        (dir: Orthogonal): string => {
            return dir.toString();
        },
        (encoded: JSONValue): Orthogonal => {
            assert(typeof encoded === 'string', 'Invalid encoded orthogonal');
            const fromString: MGPFallible<Orthogonal> = Orthogonal.factory.fromString(encoded as string);
            return fromString.get();
        },
    );

    private constructor(x: 0 | 1 | -1, y: 0 | 1 | -1) {
        super(x, y);
    }

    public getOpposite(): Orthogonal {
        const opposite: MGPFallible<Orthogonal> = Orthogonal.factory.from(-this.x, -this.y);
        return opposite.get();
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
