import { Encoder, MGPFallible, Utils } from '@everyboard/lib';

import { Direction, DirectionFactory } from './Direction';

export class TriangularDirection extends Direction {

    public static readonly LEFT: TriangularDirection = new TriangularDirection(-1, 0);
    public static readonly UP_LEFT: TriangularDirection = new TriangularDirection(-1, -1);
    public static readonly UP_RIGHT: TriangularDirection = new TriangularDirection(1, -1);
    public static readonly RIGHT: TriangularDirection = new TriangularDirection(1, 0);
    public static readonly DOWN_RIGHT: TriangularDirection = new TriangularDirection(1, 1);
    public static readonly DOWN_LEFT: TriangularDirection = new TriangularDirection(-1, 1);

    public static readonly factory: DirectionFactory<TriangularDirection> =
        new class extends DirectionFactory<TriangularDirection> {
            public all: ReadonlyArray<TriangularDirection> = [
                TriangularDirection.LEFT,
                TriangularDirection.UP_LEFT,
                TriangularDirection.UP_RIGHT,
                TriangularDirection.RIGHT,
                TriangularDirection.DOWN_RIGHT,
                TriangularDirection.DOWN_LEFT,
            ];
        };

    public static readonly encoder: Encoder<TriangularDirection> = Encoder.fromFunctions(
        (direction: TriangularDirection): number => {
            switch (direction) {
                case (TriangularDirection.LEFT): return 0;
                case (TriangularDirection.UP_LEFT): return 1;
                case (TriangularDirection.UP_RIGHT): return 2;
                case (TriangularDirection.RIGHT): return 3;
                case (TriangularDirection.DOWN_RIGHT): return 4;
                default:
                    Utils.expectToBe(direction, TriangularDirection.DOWN_LEFT);
                    return 5;
            }
        },
        (encoded: number): TriangularDirection => {
            Utils.assert(0 <= encoded && encoded <= 5, 'Invalid encoded number for TriangularDirection ' + encoded);
            return TriangularDirection.factory.all[encoded];
        },
    );

    public override getAngle(): number {
        switch (this) {
            case TriangularDirection.LEFT: return 270;
            case TriangularDirection.UP_LEFT: return 300;
            case TriangularDirection.UP_RIGHT: return 60;
            case TriangularDirection.RIGHT: return 90;
            case TriangularDirection.DOWN_RIGHT: return 120;
            default:
                Utils.expectToBe(this, TriangularDirection.DOWN_LEFT);
                return 240;
        }
    }

    public override getOpposite(): this {
        const opposite: MGPFallible<TriangularDirection> = TriangularDirection.factory.from(-this.x, -this.y);
        return opposite.get() as this;
    }

}
