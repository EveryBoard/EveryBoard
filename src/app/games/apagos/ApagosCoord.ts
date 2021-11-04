import { assert } from 'src/app/utils/utils';

export class ApagosCoord {

    public static ZERO: ApagosCoord = new ApagosCoord(0);

    public static ONE: ApagosCoord = new ApagosCoord(1);

    public static TWO: ApagosCoord = new ApagosCoord(2);

    public static THREE: ApagosCoord = new ApagosCoord(3);

    public static from(x: number): ApagosCoord {
        switch (x) {
            case 0: return ApagosCoord.ZERO;
            case 1: return ApagosCoord.ONE;
            case 2: return ApagosCoord.TWO;
            default:
                assert(x === 3, 'Invalid Apagos Coord ' + x);
                return ApagosCoord.THREE;
        }
    }
    private constructor(public readonly x: number) {}

    public equals(o: ApagosCoord): boolean {
        return this.x === o.x;
    }
}
