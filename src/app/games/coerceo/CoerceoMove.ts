import { Coord } from 'src/app/jscaip/Coord';
import { Ordinal } from 'src/app/jscaip/Ordinal';
import { Vector } from 'src/app/jscaip/Vector';
import { Encoder } from 'src/app/utils/Encoder';
import { CoerceoFailure } from './CoerceoFailure';
import { Utils } from 'src/app/utils/utils';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { MoveCoord } from 'src/app/jscaip/MoveCoord';
import { CoerceoState } from './CoerceoState';

export class CoerceoStep {

    public static LEFT: CoerceoStep = new CoerceoStep(new Vector(-2, 0), 'LEFT');

    public static UP_LEFT: CoerceoStep = new CoerceoStep(Ordinal.UP_LEFT, 'UP_LEFT');

    public static UP_RIGHT: CoerceoStep = new CoerceoStep(Ordinal.UP_RIGHT, 'UP_RIGHT');

    public static RIGHT: CoerceoStep = new CoerceoStep(new Vector(2, 0), 'RIGHT');

    public static DOWN_LEFT: CoerceoStep = new CoerceoStep(Ordinal.DOWN_LEFT, 'DOWN_LEFT');

    public static DOWN_RIGHT: CoerceoStep = new CoerceoStep(Ordinal.DOWN_RIGHT, 'DOWN_RIGHT');

    public static readonly STEPS: CoerceoStep[] = [
        CoerceoStep.LEFT,
        CoerceoStep.UP_LEFT,
        CoerceoStep.UP_RIGHT,
        CoerceoStep.RIGHT,
        CoerceoStep.DOWN_LEFT,
        CoerceoStep.DOWN_RIGHT,
    ];
    public static ofCoords(a: Coord, b: Coord): CoerceoStep {
        const vector: Vector = a.getVectorToward(b);
        const stepIndex: number = CoerceoStep.STEPS.findIndex((s: CoerceoStep) => s.direction.equals(vector));
        Utils.assert(stepIndex !== -1, CoerceoFailure.INVALID_DISTANCE());
        return CoerceoStep.STEPS[stepIndex];
    }
    private constructor(public readonly direction: Vector, public readonly str: string) {}
}

export class CoerceoRegularMove extends MoveCoordToCoord {

    public static readonly encoder: Encoder<CoerceoRegularMove> = MoveCoordToCoord.getEncoder(CoerceoRegularMove.of);

    public static of(start: Coord, end: Coord): CoerceoRegularMove {
        const step: CoerceoStep = CoerceoStep.ofCoords(start, end);
        const move: CoerceoRegularMove = CoerceoRegularMove.ofMovement(start, step);
        return move;
    }
    public static ofMovement(start: Coord, step: CoerceoStep): CoerceoRegularMove {
        Utils.assert(CoerceoState.isOnBoard(start), 'Starting coord cannot be out of range (width: 15, height: 10).');
        const landingCoord: Coord = new Coord(start.x + step.direction.x, start.y + step.direction.y);
        Utils.assert(CoerceoState.isOnBoard(landingCoord), 'Landing coord cannot be out of range (width: 15, height: 10).');
        return new CoerceoRegularMove(start, landingCoord);
    }
    private constructor(start: Coord, end: Coord) {
        super(start, end);
    }
    public override toString(): string {
        return 'CoerceoRegularMove(' + this.getStart().toString() + ' > ' + this.getEnd().toString() + ')';
    }
    public override equals(other: CoerceoMove): boolean {
        if (CoerceoMove.isTileExchange(other)) {
            return false;
        } else {
            return super.equals(other as this);
        }
    }
}

export class CoerceoTileExchangeMove extends MoveCoord {

    public static encoder: Encoder<CoerceoTileExchangeMove> = MoveCoord.getEncoder(CoerceoTileExchangeMove.of);

    public static of(capture: Coord): CoerceoTileExchangeMove {
        Utils.assert(CoerceoState.isOnBoard(capture), 'Captured coord cannot be out of range (width: 15, height: 10).');
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

export type CoerceoMove = CoerceoTileExchangeMove | CoerceoRegularMove;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace CoerceoMove {

    export function isNormalMove(move: CoerceoMove): move is CoerceoRegularMove {
        return move instanceof CoerceoRegularMove;
    }
    export function isTileExchange(move: CoerceoMove): move is CoerceoTileExchangeMove {
        return move instanceof CoerceoTileExchangeMove;
    }
    export const encoder: Encoder<CoerceoMove> =
        Encoder.disjunction([CoerceoMove.isNormalMove, CoerceoMove.isTileExchange],
                            [CoerceoRegularMove.encoder, CoerceoTileExchangeMove.encoder]);
}
