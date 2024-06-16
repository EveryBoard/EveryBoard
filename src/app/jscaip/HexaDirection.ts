import { Direction, DirectionFactory } from './Direction';
import { Encoder, MGPFallible, Utils } from '@everyboard/lib';

/** Hexagonal directions encoded with axial coordinates, for "flat toped" hexagons */
export class HexaDirection extends Direction {

    public static readonly UP: HexaDirection = new HexaDirection(0, -1);

    public static readonly UP_UP_RIGHT: HexaDirection = new HexaDirection(1, -2);

    public static readonly UP_RIGHT: HexaDirection = new HexaDirection(1, -1);

    public static readonly PURE_RIGHT: HexaDirection = new HexaDirection(2, -1);

    public static readonly RIGHT: HexaDirection = new HexaDirection(1, 0);

    public static readonly DOWN_RIGHT: HexaDirection = new HexaDirection(1, 1);

    public static readonly DOWN: HexaDirection = new HexaDirection(0, 1);

    public static readonly DOWN_DOWN_LEFT: HexaDirection = new HexaDirection(-1, 2);

    public static readonly DOWN_LEFT: HexaDirection = new HexaDirection(-1, 1);

    public static readonly PURE_LEFT: HexaDirection = new HexaDirection(-2, 1);

    public static readonly LEFT: HexaDirection = new HexaDirection(-1, 0);

    public static readonly UP_LEFT: HexaDirection = new HexaDirection(-1, -1);

    public static readonly factory: DirectionFactory<HexaDirection> =
        new class extends DirectionFactory<HexaDirection> {
            public all: ReadonlyArray<HexaDirection> = [
                HexaDirection.UP,
                HexaDirection.UP_RIGHT,
                HexaDirection.RIGHT,
                HexaDirection.DOWN,
                HexaDirection.DOWN_LEFT,
                HexaDirection.LEFT,
                HexaDirection.UP_UP_RIGHT,
                HexaDirection.PURE_RIGHT,
                HexaDirection.DOWN_RIGHT,
                HexaDirection.DOWN_DOWN_LEFT,
                HexaDirection.PURE_LEFT,
                HexaDirection.UP_LEFT,
            ];
        };

    public static readonly encoder: Encoder<HexaDirection> = Encoder.fromFunctions(
        (direction: HexaDirection): number => {
            switch (direction) {
                case (HexaDirection.UP): return 0;
                case (HexaDirection.UP_RIGHT): return 1;
                case (HexaDirection.RIGHT): return 2;
                case (HexaDirection.DOWN): return 3;
                case (HexaDirection.DOWN_LEFT): return 4;
                case (HexaDirection.LEFT): return 5;
                case (HexaDirection.UP_UP_RIGHT): return 6;
                case (HexaDirection.PURE_RIGHT): return 7;
                case (HexaDirection.DOWN_RIGHT): return 8;
                case (HexaDirection.DOWN_DOWN_LEFT): return 9;
                case (HexaDirection.UP_LEFT): return 10;
                default:
                    Utils.expectToBe(direction, HexaDirection.UP_LEFT);
                    return 11;
            }
        },
        (encoded: number): HexaDirection => {
            Utils.assert(0 <= encoded && encoded <= 5, 'Invalid encoded number for HexaDirection ' + encoded);
            return HexaDirection.factory.all[encoded];
        },
    );

    public override getAngle(): number {
        switch (this) {
            case HexaDirection.UP: return 0;
            case HexaDirection.UP_UP_RIGHT: return 30;
            case HexaDirection.UP_RIGHT: return 60;
            case HexaDirection.PURE_RIGHT: return 90;
            case HexaDirection.RIGHT: return 120;
            case HexaDirection.DOWN_RIGHT: return 150;
            case HexaDirection.DOWN: return 180;
            case HexaDirection.DOWN_DOWN_LEFT: return 210;
            case HexaDirection.DOWN_LEFT: return 240;
            case HexaDirection.PURE_LEFT: return 270;
            case HexaDirection.LEFT: return 300;
            default:
                Utils.expectToBe(this, HexaDirection.UP_LEFT);
                return 330;
        }
    }

    private constructor(x: -2|-1|0|1|2, y: -2|-1|0|1|2) {
        super(x, y);
    }

    public getOpposite(): this {
        const opposite: MGPFallible<HexaDirection> = HexaDirection.factory.from(-this.x, -this.y);
        return opposite.get() as this;
    }

}
