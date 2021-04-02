import { assert, JSONValue } from 'src/app/utils/collection-lib/utils';
import { BaseDirection, DirectionFactory } from '../Direction';
import { Encoder } from '../encoder';

/** Hexagonal directions encoded with axial coordinates, for "flat toped" hexagons */
export class HexaDirection extends BaseDirection {
    public static readonly UP: HexaDirection = new HexaDirection(0, -1);
    public static readonly UP_LEFT: HexaDirection = new HexaDirection(-1, 0);
    public static readonly UP_RIGHT: HexaDirection = new HexaDirection(1, -1);
    public static readonly DOWN_LEFT: HexaDirection = new HexaDirection(-1, 1);
    public static readonly DOWN_RIGHT: HexaDirection = new HexaDirection(1, 0);
    public static readonly DOWN: HexaDirection = new HexaDirection(0, 1);
    public static readonly factory: DirectionFactory<HexaDirection> =
        new class extends DirectionFactory<HexaDirection> {
            public all: ReadonlyArray<HexaDirection> = [
                HexaDirection.UP,
                HexaDirection.UP_RIGHT,
                HexaDirection.DOWN_RIGHT,
                HexaDirection.DOWN,
                HexaDirection.DOWN_LEFT,
                HexaDirection.UP_LEFT,
            ];
        };
    public static readonly encoder: Encoder<HexaDirection> =
        Encoder.of((dir: HexaDirection) => {
            return dir.toString();
        }, (encoded: JSONValue) => {
            assert(typeof encoded === 'string', 'Invalid encoded HexaDirection');
            return HexaDirection.factory.fromString(encoded as string);
        });

    private constructor(public readonly x: 0|1|-1, public readonly y: 0|1|-1) {
        super();
    }
    public getOpposite(): HexaDirection {
        return HexaDirection.factory.of(-this.x, -this.y);
    }
}
