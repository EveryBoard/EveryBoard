import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Vector } from 'src/app/jscaip/Vector';
import { Encoder } from 'src/app/utils/Encoder';
import { ComparableObject } from 'src/app/utils/Comparable';
import { CoerceoFailure } from './CoerceoFailure';
import { Utils } from 'src/app/utils/utils';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class CoerceoStep implements ComparableObject {

    public static LEFT: CoerceoStep = new CoerceoStep(new Vector(-2, 0), 'LEFT');

    public static UP_LEFT: CoerceoStep = new CoerceoStep(Direction.UP_LEFT, 'UP_LEFT');

    public static UP_RIGHT: CoerceoStep = new CoerceoStep(Direction.UP_RIGHT, 'UP_RIGHT');

    public static RIGHT: CoerceoStep = new CoerceoStep(new Vector(2, 0), 'RIGHT');

    public static DOWN_LEFT: CoerceoStep = new CoerceoStep(Direction.DOWN_LEFT, 'DOWN_LEFT');

    public static DOWN_RIGHT: CoerceoStep = new CoerceoStep(Direction.DOWN_RIGHT, 'DOWN_RIGHT');

    public static readonly STEPS: CoerceoStep[] = [
        CoerceoStep.LEFT,
        CoerceoStep.UP_LEFT,
        CoerceoStep.UP_RIGHT,
        CoerceoStep.RIGHT,
        CoerceoStep.DOWN_LEFT,
        CoerceoStep.DOWN_RIGHT,
    ];
    public static fromCoords(a: Coord, b: Coord): CoerceoStep {
        const vector: Vector = a.getVectorToward(b);
        const stepIndex: number = CoerceoStep.STEPS.findIndex((s: CoerceoStep) => s.direction.equals(vector));
        if (stepIndex === -1) {
            throw new Error(CoerceoFailure.INVALID_DISTANCE());
        } else {
            return CoerceoStep.STEPS[stepIndex];
        }
    }

    private constructor(public readonly direction: Vector, public readonly str: string) {}

    public equals(other: CoerceoStep): boolean {
        return this === other;
    }
    public toString(): string {
        return this.str;
    }
}

export class CoerceoNormalMove extends MoveCoordToCoord {

    public static readonly encoder: Encoder<CoerceoNormalMove> = MoveCoordToCoord.getEncoder(CoerceoNormalMove.strictFrom);

    private static strictFrom(start: Coord, end: Coord): MGPFallible<CoerceoNormalMove> {
        const step: CoerceoStep = CoerceoStep.fromCoords(start, end);
        return MGPFallible.success(CoerceoNormalMove.fromMovement(start, step));
    }
    public static from(start: Coord, end: Coord): MGPFallible<CoerceoMove> {
        return CoerceoNormalMove.strictFrom(start, end);
    }
    public static fromMovement(start: Coord, step: CoerceoStep): CoerceoNormalMove {
        Utils.assert(start.isInRange(15, 10), 'Starting coord cannot be out of range (width: 15, height: 10).');
        const landingCoord: Coord = new Coord(start.x + step.direction.x, start.y + step.direction.y);
        Utils.assert(landingCoord.isInRange(15, 10), 'Landing coord cannot be out of range (width: 15, height: 10).');
        return new CoerceoNormalMove(start, landingCoord);
    }
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public isTileExchange(): this is CoerceoTileExchangeMove {
        return false;
    }
    public override toString(): string {
        return 'CoerceoNormalMove(' + this.getStart().toString() + ' > ' + this.getEnd().toString() + ')';
    }
}

export class CoerceoTileExchangeMove extends MoveCoord {

    public override toString(): string {
        throw new Error('Method not implemented.');
    }
    public static encoder: Encoder<CoerceoTileExchangeMove> = MoveCoord.getEncoder(CoerceoTileExchangeMove.strictFrom);

    private static strictFrom(capture: Coord): MGPFallible<CoerceoTileExchangeMove> {
        Utils.assert(capture.isInRange(15, 10), 'Captured coord cannot be out of range (width: 15, height: 10).');
        return MGPFallible.success(new CoerceoTileExchangeMove(capture));
    }
    public static from(capture: Coord): MGPFallible<CoerceoMove> {
        return CoerceoTileExchangeMove.strictFrom(capture);
    }
    private constructor(capture: Coord) {
        super(capture.x, capture.y);
    }
    public isTileExchange(): this is CoerceoTileExchangeMove {
        return true;
    }
}

export type CoerceoMove = CoerceoTileExchangeMove | CoerceoNormalMove;

export const CoerceoMoveEncoder: Encoder<CoerceoMove> =
    Encoder.disjunction(CoerceoNormalMove.encoder,
                        CoerceoTileExchangeMove.encoder,
                        (move: CoerceoNormalMove): move is CoerceoNormalMove => {
                            return move instanceof CoerceoNormalMove;
                        });
