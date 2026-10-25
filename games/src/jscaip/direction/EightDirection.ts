import { Encoder, JSONValue, MGPFallible, Utils } from '@everyboard/lib';

import { Direction, DirectionFactory } from './Direction';

/**
 * EightDirection as in both orthogonal and diagonal
 */
export class EightDirection extends Direction {

    private readonly type: string = 'EightDirection'; // To force type distinction

    public static readonly UP: EightDirection = new EightDirection(0, -1);
    public static readonly UP_RIGHT: EightDirection = new EightDirection(1, -1);
    public static readonly RIGHT: EightDirection = new EightDirection(1, 0);
    public static readonly DOWN_RIGHT: EightDirection = new EightDirection(1, 1);
    public static readonly DOWN: EightDirection = new EightDirection(0, 1);
    public static readonly DOWN_LEFT: EightDirection = new EightDirection(-1, 1);
    public static readonly LEFT: EightDirection = new EightDirection(-1, 0);
    public static readonly UP_LEFT: EightDirection = new EightDirection(-1, -1);
    public static readonly factory: DirectionFactory<EightDirection> =
        new class extends DirectionFactory<EightDirection> {
            public all: ReadonlyArray<EightDirection> = [
                EightDirection.RIGHT,
                EightDirection.DOWN_RIGHT,
                EightDirection.DOWN,
                EightDirection.DOWN_LEFT,
                EightDirection.LEFT,
                EightDirection.UP_LEFT,
                EightDirection.UP,
                EightDirection.UP_RIGHT,
            ];
        };

    public static readonly EIGHT_DIRECTIONS: ReadonlyArray<EightDirection> = EightDirection.factory.all;

    public static readonly DIAGONALS: ReadonlyArray<EightDirection> = [
        EightDirection.UP_RIGHT,
        EightDirection.DOWN_RIGHT,
        EightDirection.DOWN_LEFT,
        EightDirection.UP_LEFT,
    ];

    public static readonly ORTHOGONALS: ReadonlyArray<EightDirection> = [
        EightDirection.UP,
        EightDirection.RIGHT,
        EightDirection.DOWN,
        EightDirection.LEFT,
    ];

    public static readonly encoder: Encoder<EightDirection> = Encoder.fromFunctions(
        (dir: EightDirection): string => {
            return dir.toString();
        },
        (encoded: JSONValue): EightDirection => {
            Utils.assert(typeof encoded === 'string', 'Invalid encoded direction');
            const fromString: MGPFallible<EightDirection> = EightDirection.factory.fromString(encoded as string);
            return fromString.get();
        },
    );

    public getAngle(): number {
        switch (this) {
            case EightDirection.RIGHT: return 0;
            case EightDirection.DOWN_RIGHT: return 45;
            case EightDirection.DOWN: return 90;
            case EightDirection.DOWN_LEFT: return 135;
            case EightDirection.LEFT: return 180;
            case EightDirection.UP_LEFT: return 225;
            case EightDirection.UP: return 270;
            default:
                Utils.expectToBe(this, EightDirection.UP_RIGHT);
                return 315;
        }
    }

    public override getOpposite(): this {
        const opposite: MGPFallible<EightDirection> = EightDirection.factory.from(-this.x, -this.y);
        return opposite.get() as this;
    }

}
