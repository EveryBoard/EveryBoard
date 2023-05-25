import { assert } from 'src/app/utils/assert';
import { Encoder } from 'src/app/utils/Encoder';
import { JSONValueWithoutArray, Utils } from 'src/app/utils/utils';

export class ApagosCoord {

    public static encoder: Encoder<ApagosCoord> = new class extends Encoder<ApagosCoord> {
        public encode(coord: ApagosCoord): JSONValueWithoutArray {
            return coord.x;
        }
        public decode(encoded: JSONValueWithoutArray): ApagosCoord {
            Utils.assert(encoded != null, 'Invalid encoded ApagosCoord: ' + encoded);
            return ApagosCoord.of(encoded as number);
        }
    };
    public static ZERO: ApagosCoord = new ApagosCoord(0);

    public static ONE: ApagosCoord = new ApagosCoord(1);

    public static TWO: ApagosCoord = new ApagosCoord(2);

    public static THREE: ApagosCoord = new ApagosCoord(3);

    public static of(x: number): ApagosCoord {
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

    public equals(other: ApagosCoord): boolean {
        return this.x === other.x;
    }
}
