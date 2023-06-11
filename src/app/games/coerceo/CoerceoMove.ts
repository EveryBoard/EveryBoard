import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Vector } from 'src/app/jscaip/Vector';
import { Encoder } from 'src/app/utils/Encoder';
import { CoerceoFailure } from './CoerceoFailure';
import { Utils } from 'src/app/utils/utils';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class CoerceoStep {

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
        Utils.assert(stepIndex !== -1, CoerceoFailure.INVALID_DISTANCE());
        return CoerceoStep.STEPS[stepIndex];
    }
    private constructor(public readonly direction: Vector, public readonly str: string) {}
}

export class CoerceoNormalMove extends MoveCoordToCoord {

    public static readonly encoder: Encoder<CoerceoNormalMove> =
        MoveCoordToCoord.getEncoder(CoerceoNormalMove.strictFrom);

    private static strictFrom(start: Coord, end: Coord): MGPFallible<CoerceoNormalMove> {
        const step: CoerceoStep = CoerceoStep.fromCoords(start, end);
        const move: CoerceoNormalMove = CoerceoNormalMove.fromMovement(start, step) as CoerceoNormalMove;
        return MGPFallible.success(move);
    }
    public static from(start: Coord, end: Coord): MGPFallible<CoerceoMove> {
        return CoerceoNormalMove.strictFrom(start, end);
    }
    public static fromMovement(start: Coord, step: CoerceoStep): CoerceoMove {
        Utils.assert(start.isInRange(15, 10), 'Starting coord cannot be out of range (width: 15, height: 10).');
        const landingCoord: Coord = new Coord(start.x + step.direction.x, start.y + step.direction.y);
        Utils.assert(landingCoord.isInRange(15, 10), 'Landing coord cannot be out of range (width: 15, height: 10).');
        return new CoerceoNormalMove(start, landingCoord);
    }
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public override toString(): string {
        return 'CoerceoNormalMove(' + this.getStart().toString() + ' > ' + this.getEnd().toString() + ')';
    }
    public override equals(other: CoerceoMove): boolean {
        if (CoerceoMove.isTileExchange(other)) {
            return false;
        } else {
            return MoveCoordToCoord.equals(this, other);
        }
    }
}

export class CoerceoTileExchangeMove extends MoveCoord {

    public static encoder: Encoder<CoerceoTileExchangeMove> = MoveCoord.getEncoder(CoerceoTileExchangeMove.strictFrom);

    private static strictFrom(capture: Coord): MGPFallible<CoerceoTileExchangeMove> {
        // TODO FOR REVIEW: genre on est d'accord que thrower dans une fonction qui donne du Fallible, c'con ?
        Utils.assert(capture.isInRange(15, 10), 'Captured coord cannot be out of range (width: 15, height: 10).');
        return MGPFallible.success(new CoerceoTileExchangeMove(capture));
    }
    public static of(capture: Coord): CoerceoMove {
        Utils.assert(capture.isInRange(15, 10), 'Captured coord cannot be out of range (width: 15, height: 10).');
        return new CoerceoTileExchangeMove(capture);
    }
    private constructor(capture: Coord) {
        super(capture.x, capture.y);
    }
    public override toString(): string {
        return 'CoerceoTileExchangeMove(' + this.coord.x + ', ' + this.coord.y + ')';
    }
    public override equals(other: CoerceoMove): boolean {
        if (CoerceoMove.isTileExchange(other)) {
            return other.coord.equals(this.coord);
        } else {
            return false;
        }
    }
}

export type CoerceoMove = CoerceoTileExchangeMove | CoerceoNormalMove;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace CoerceoMove {

    export function isNormalMove(move: CoerceoMove): move is CoerceoNormalMove {
        return move instanceof CoerceoNormalMove;
    }
    export function isTileExchange(move: CoerceoMove): move is CoerceoTileExchangeMove {
        return move instanceof CoerceoTileExchangeMove;
    }
    export const encoder: Encoder<CoerceoMove> =
        Encoder.disjunction([CoerceoMove.isNormalMove, CoerceoMove.isTileExchange],
                            [CoerceoNormalMove.encoder, CoerceoTileExchangeMove.encoder]);
}
