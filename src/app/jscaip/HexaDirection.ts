import { Utils } from 'src/app/utils/utils';
import { MGPFallible } from '../utils/MGPFallible';
import { BaseDirection, DirectionFactory } from './Direction';
import { Encoder } from '../utils/Encoder';

/** Hexagonal directions encoded with axial coordinates, for "flat toped" hexagons */
export class HexaDirection extends BaseDirection {

    public static readonly UP: HexaDirection = new HexaDirection(0, -1);

    public static readonly LEFT: HexaDirection = new HexaDirection(-1, 0);

    public static readonly UP_RIGHT: HexaDirection = new HexaDirection(1, -1);

    public static readonly DOWN_LEFT: HexaDirection = new HexaDirection(-1, 1);

    public static readonly RIGHT: HexaDirection = new HexaDirection(1, 0);

    public static readonly DOWN: HexaDirection = new HexaDirection(0, 1);

    public static readonly factory: DirectionFactory<HexaDirection> =
        new class extends DirectionFactory<HexaDirection> {
            public all: ReadonlyArray<HexaDirection> = [
                HexaDirection.UP,
                HexaDirection.UP_RIGHT,
                HexaDirection.RIGHT,
                HexaDirection.DOWN,
                HexaDirection.DOWN_LEFT,
                HexaDirection.LEFT,
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
                default: return 5;
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
            case HexaDirection.UP_RIGHT: return 60;
            case HexaDirection.RIGHT: return 120;
            case HexaDirection.DOWN: return 180;
            case HexaDirection.DOWN_LEFT: return 240;
            default:
                Utils.expectToBe(this, HexaDirection.LEFT);
                return 300;
        }
    }

    private constructor(x: 0|1|-1, y: 0|1|-1) {
        super(x, y);
    }
    public getOpposite(): HexaDirection {
        const opposite: MGPFallible<HexaDirection> = HexaDirection.factory.from(-this.x, -this.y);
        return opposite.get();
    }
}
