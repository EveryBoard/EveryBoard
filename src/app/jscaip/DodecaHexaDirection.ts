import { Encoder, MGPFallible, Utils } from '@everyboard/lib';
import { Direction, DirectionFactory } from './Direction';


export class DodecaHexaDirection extends Direction {

    public static readonly UP: DodecaHexaDirection = new DodecaHexaDirection(0, -1);
    public static readonly UP_UP_RIGHT: DodecaHexaDirection = new DodecaHexaDirection(1, -2);
    public static readonly UP_RIGHT: DodecaHexaDirection = new DodecaHexaDirection(1, -1);
    public static readonly PURE_RIGHT: DodecaHexaDirection = new DodecaHexaDirection(2, -1);
    public static readonly RIGHT: DodecaHexaDirection = new DodecaHexaDirection(1, 0);
    public static readonly DOWN_RIGHT: DodecaHexaDirection = new DodecaHexaDirection(1, 1);
    public static readonly DOWN: DodecaHexaDirection = new DodecaHexaDirection(0, 1);
    public static readonly DOWN_DOWN_LEFT: DodecaHexaDirection = new DodecaHexaDirection(-1, 2);
    public static readonly DOWN_LEFT: DodecaHexaDirection = new DodecaHexaDirection(-1, 1);
    public static readonly PURE_LEFT: DodecaHexaDirection = new DodecaHexaDirection(-2, 1);
    public static readonly LEFT: DodecaHexaDirection = new DodecaHexaDirection(-1, 0);
    public static readonly UP_LEFT: DodecaHexaDirection = new DodecaHexaDirection(-1, -1);

    public static readonly factory: DirectionFactory<DodecaHexaDirection> =
        new class extends DirectionFactory<DodecaHexaDirection> {
            public all: ReadonlyArray<DodecaHexaDirection> = [
                DodecaHexaDirection.UP,
                DodecaHexaDirection.UP_RIGHT,
                DodecaHexaDirection.RIGHT,
                DodecaHexaDirection.DOWN,
                DodecaHexaDirection.DOWN_LEFT,
                DodecaHexaDirection.LEFT,
                DodecaHexaDirection.UP_UP_RIGHT,
                DodecaHexaDirection.PURE_RIGHT,
                DodecaHexaDirection.DOWN_RIGHT,
                DodecaHexaDirection.DOWN_DOWN_LEFT,
                DodecaHexaDirection.PURE_LEFT,
                DodecaHexaDirection.UP_LEFT,
            ];
        };

    public static readonly encoder: Encoder<DodecaHexaDirection> = Encoder.fromFunctions(
        (direction: DodecaHexaDirection): number => {
            switch (direction) {
                case (DodecaHexaDirection.UP): return 0;
                case (DodecaHexaDirection.UP_RIGHT): return 1;
                case (DodecaHexaDirection.RIGHT): return 2;
                case (DodecaHexaDirection.DOWN): return 3;
                case (DodecaHexaDirection.DOWN_LEFT): return 4;
                case (DodecaHexaDirection.LEFT): return 5;
                case (DodecaHexaDirection.UP_UP_RIGHT): return 6;
                case (DodecaHexaDirection.PURE_RIGHT): return 7;
                case (DodecaHexaDirection.DOWN_RIGHT): return 8;
                case (DodecaHexaDirection.DOWN_DOWN_LEFT): return 9;
                case (DodecaHexaDirection.UP_LEFT): return 10;
                default:
                    Utils.expectToBe(direction, DodecaHexaDirection.UP_LEFT);
                    return 11;
            }
        },
        (encoded: number): DodecaHexaDirection => {
            Utils.assert(0 <= encoded && encoded <= 11, 'Invalid encoded number for DodecaHexaDirection ' + encoded);
            return DodecaHexaDirection.factory.all[encoded];
        },
    );

    public override getAngle(): number {
        switch (this) {
            case DodecaHexaDirection.UP: return 0;
            case DodecaHexaDirection.UP_UP_RIGHT: return 30;
            case DodecaHexaDirection.UP_RIGHT: return 60;
            case DodecaHexaDirection.PURE_RIGHT: return 90;
            case DodecaHexaDirection.RIGHT: return 120;
            case DodecaHexaDirection.DOWN_RIGHT: return 150;
            case DodecaHexaDirection.DOWN: return 180;
            case DodecaHexaDirection.DOWN_DOWN_LEFT: return 210;
            case DodecaHexaDirection.DOWN_LEFT: return 240;
            case DodecaHexaDirection.PURE_LEFT: return 270;
            case DodecaHexaDirection.LEFT: return 300;
            default:
                Utils.expectToBe(this, DodecaHexaDirection.UP_LEFT);
                return 330;
        }
    }

    private constructor(x: -2 | -1 | 0 | 1 | 2, y: -2 | -1 | 0 | 1 | 2) {
        super(x, y);
    }

    public getOpposite(): this {
        const opposite: MGPFallible<DodecaHexaDirection> = DodecaHexaDirection.factory.from(-this.x, -this.y);
        return opposite.get() as this;
    }

    public override toString(): string {
        if (this.x === 1 && this.y === -2) return 'UP_UP_RIGHT';
        if (this.x === 2 && this.y === -1) return 'PURE_RIGHT';
        if (this.x === -1 && this.y === 2) return 'DOWN_DOWN_RIGHT';
        if (this.x === -2 && this.y === 1) return 'PURE_RIGHT';
        else return super.toString();
    }

}
