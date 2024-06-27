import { Encoder, MGPFallible, Utils } from '@everyboard/lib';
import { Direction, DirectionFactory } from './Direction';


export class DodecaHexaDirection extends Direction {

    public static readonly DIRECTION_000: DodecaHexaDirection = new DodecaHexaDirection(0, -1);
    public static readonly DIRECTION_030: DodecaHexaDirection = new DodecaHexaDirection(1, -2);
    public static readonly DIRECTION_060: DodecaHexaDirection = new DodecaHexaDirection(1, -1);
    public static readonly DIRECTION_090: DodecaHexaDirection = new DodecaHexaDirection(2, -1);
    public static readonly DIRECTION_120: DodecaHexaDirection = new DodecaHexaDirection(1, 0);
    public static readonly DIRECTION_150: DodecaHexaDirection = new DodecaHexaDirection(1, 1);
    public static readonly DIRECTION_180: DodecaHexaDirection = new DodecaHexaDirection(0, 1);
    public static readonly DIRECTION_210: DodecaHexaDirection = new DodecaHexaDirection(-1, 2);
    public static readonly DIRECTION_240: DodecaHexaDirection = new DodecaHexaDirection(-1, 1);
    public static readonly DIRECTION_270: DodecaHexaDirection = new DodecaHexaDirection(-2, 1);
    public static readonly DIRECTION_300: DodecaHexaDirection = new DodecaHexaDirection(-1, 0);
    public static readonly DIRECTION_330: DodecaHexaDirection = new DodecaHexaDirection(-1, -1);

    public static readonly factory: DirectionFactory<DodecaHexaDirection> =
        new class extends DirectionFactory<DodecaHexaDirection> {
            public all: ReadonlyArray<DodecaHexaDirection> = [
                DodecaHexaDirection.DIRECTION_000,
                DodecaHexaDirection.DIRECTION_030,
                DodecaHexaDirection.DIRECTION_060,
                DodecaHexaDirection.DIRECTION_090,
                DodecaHexaDirection.DIRECTION_120,
                DodecaHexaDirection.DIRECTION_150,
                DodecaHexaDirection.DIRECTION_180,
                DodecaHexaDirection.DIRECTION_210,
                DodecaHexaDirection.DIRECTION_240,
                DodecaHexaDirection.DIRECTION_270,
                DodecaHexaDirection.DIRECTION_300,
                DodecaHexaDirection.DIRECTION_330,
            ];
        };

    public static readonly encoder: Encoder<DodecaHexaDirection> = Encoder.fromFunctions(
        (direction: DodecaHexaDirection): number => {
            switch (direction) {
                case (DodecaHexaDirection.DIRECTION_000): return 0;
                case (DodecaHexaDirection.DIRECTION_030): return 1;
                case (DodecaHexaDirection.DIRECTION_060): return 2;
                case (DodecaHexaDirection.DIRECTION_090): return 3;
                case (DodecaHexaDirection.DIRECTION_120): return 4;
                case (DodecaHexaDirection.DIRECTION_150): return 5;
                case (DodecaHexaDirection.DIRECTION_180): return 6;
                case (DodecaHexaDirection.DIRECTION_210): return 7;
                case (DodecaHexaDirection.DIRECTION_240): return 8;
                case (DodecaHexaDirection.DIRECTION_270): return 9;
                case (DodecaHexaDirection.DIRECTION_300): return 10;
                default:
                    Utils.expectToBe(direction, DodecaHexaDirection.DIRECTION_330);
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
            case DodecaHexaDirection.DIRECTION_000: return 0;
            case DodecaHexaDirection.DIRECTION_030: return 30;
            case DodecaHexaDirection.DIRECTION_060: return 60;
            case DodecaHexaDirection.DIRECTION_090: return 90;
            case DodecaHexaDirection.DIRECTION_120: return 120;
            case DodecaHexaDirection.DIRECTION_150: return 150;
            case DodecaHexaDirection.DIRECTION_180: return 180;
            case DodecaHexaDirection.DIRECTION_210: return 210;
            case DodecaHexaDirection.DIRECTION_240: return 240;
            case DodecaHexaDirection.DIRECTION_270: return 270;
            case DodecaHexaDirection.DIRECTION_300: return 300;
            default:
                Utils.expectToBe(this, DodecaHexaDirection.DIRECTION_330);
                return 330;
        }
    }

    public override getOpposite(): this {
        const opposite: MGPFallible<DodecaHexaDirection> = DodecaHexaDirection.factory.from(-this.x, -this.y);
        return opposite.get() as this;
    }

    public override toString(): string {
        if (this.x === 1 && this.y === -2) return 'DIRECTION_030';
        if (this.x === 2 && this.y === -1) return 'DIRECTION_090';
        if (this.x === -1 && this.y === 2) return 'DIRECTION_210';
        if (this.x === -2 && this.y === 1) return 'DIRECTION_270';
        else return super.toString();
    }

}
