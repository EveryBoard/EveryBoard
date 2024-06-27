import { Encoder, JSONValue, MGPFallible, Utils } from '@everyboard/lib';
import { Direction, DirectionFactory } from './Direction';

/**
 * Ordinal as in both orthogonal and diagonal
 */
export class Ordinal extends Direction {

    public static readonly UP: Ordinal = new Ordinal(0, -1);
    public static readonly UP_RIGHT: Ordinal = new Ordinal(1, -1);
    public static readonly RIGHT: Ordinal = new Ordinal(1, 0);
    public static readonly DOWN_RIGHT: Ordinal = new Ordinal(1, 1);
    public static readonly DOWN: Ordinal = new Ordinal(0, 1);
    public static readonly DOWN_LEFT: Ordinal = new Ordinal(-1, 1);
    public static readonly LEFT: Ordinal = new Ordinal(-1, 0);
    public static readonly UP_LEFT: Ordinal = new Ordinal(-1, -1);
    public static readonly factory: DirectionFactory<Ordinal> =
        new class extends DirectionFactory<Ordinal> {
            public all: ReadonlyArray<Ordinal> = [
                Ordinal.RIGHT,
                Ordinal.DOWN_RIGHT,
                Ordinal.DOWN,
                Ordinal.DOWN_LEFT,
                Ordinal.LEFT,
                Ordinal.UP_LEFT,
                Ordinal.UP,
                Ordinal.UP_RIGHT,
            ];
        };

    public static readonly ORDINALS: ReadonlyArray<Ordinal> = Ordinal.factory.all;

    public static readonly DIAGONALS: ReadonlyArray<Ordinal> = [
        Ordinal.UP_RIGHT,
        Ordinal.DOWN_RIGHT,
        Ordinal.DOWN_LEFT,
        Ordinal.UP_LEFT,
    ];

    public static readonly ORTHOGONALS: ReadonlyArray<Ordinal> = [
        Ordinal.UP,
        Ordinal.RIGHT,
        Ordinal.DOWN,
        Ordinal.LEFT,
    ];

    public static readonly encoder: Encoder<Ordinal> = Encoder.fromFunctions(
        (dir: Ordinal): string => {
            return dir.toString();
        },
        (encoded: JSONValue): Ordinal => {
            Utils.assert(typeof encoded === 'string', 'Invalid encoded direction');
            const fromString: MGPFallible<Ordinal> = Ordinal.factory.fromString(encoded as string);
            return fromString.get();
        },
    );

    public getAngle(): number {
        switch (this) {
            case Ordinal.RIGHT: return 0;
            case Ordinal.DOWN_RIGHT: return 45;
            case Ordinal.DOWN: return 90;
            case Ordinal.DOWN_LEFT: return 135;
            case Ordinal.LEFT: return 180;
            case Ordinal.UP_LEFT: return 225;
            case Ordinal.UP: return 270;
            default:
                Utils.expectToBe(this, Ordinal.UP_RIGHT);
                return 315;
        }
    }

    public override getOpposite(): this {
        const opposite: MGPFallible<Ordinal> = Ordinal.factory.from(-this.x, -this.y);
        return opposite.get() as this;
    }

}
