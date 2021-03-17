import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction, Vector } from 'src/app/jscaip/DIRECTION';
import { Move } from 'src/app/jscaip/Move';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { CoerceoFailure } from '../coerceo-rules/CoerceoRules';

export class CoerceoStep {

    public static LEFT: CoerceoStep = new CoerceoStep(new Vector(-2, 0));

    public static UP_LEFT: CoerceoStep = new CoerceoStep(Direction.UP_LEFT);

    public static UP_RIGHT: CoerceoStep = new CoerceoStep(Direction.UP_RIGHT);

    public static RIGHT: CoerceoStep = new CoerceoStep(new Vector(2, 0));

    public static DOWN_LEFT: CoerceoStep = new CoerceoStep(Direction.DOWN_LEFT);

    public static DOWN_RIGHT: CoerceoStep = new CoerceoStep(Direction.DOWN_RIGHT);

    private constructor(public readonly direction: Vector) {}
}

export class CoerceoMove extends Move {

    public static fromMove(start: Coord,
                           step: CoerceoStep): CoerceoMove
    {
        if (start.isNotInRange(15, 10)) {
            throw new Error('Starting coord cannot be out of range (width: 15, height: 10).');
        }
        if (step == null) {
            throw new Error('Step cannot be null.');
        }
        if (!(step instanceof CoerceoStep)) {
            throw new Error(CoerceoFailure.INVALID_DISTANCE);
        }
        const landingCoord: Coord = new Coord(start.x + step.direction.x, start.y + step.direction.y);
        if (landingCoord.isNotInRange(15, 10)) {
            throw new Error('Landing coord cannot be out of range (width: 15, height: 10).');
        }
        return new CoerceoMove(MGPOptional.of(start),
                               MGPOptional.of(landingCoord),
                               MGPOptional.empty());
    }
    public static fromTilesExchange(capture: Coord): CoerceoMove {
        if (capture.isNotInRange(15, 10)) {
            throw new Error('Captured coord cannot be out of range (width: 15, height: 10).');
        }
        return new CoerceoMove(MGPOptional.empty(),
                               MGPOptional.empty(),
                               MGPOptional.of(capture));
    }
    private constructor(public readonly start: MGPOptional<Coord>,
                        public readonly landingCoord: MGPOptional<Coord>,
                        public readonly capture: MGPOptional<Coord>)
    {
        super();
    }
    public isTileExchange(): boolean {
        return this.capture.isPresent();
    }
    public toString(): string {
        throw new Error('Method not implemented.');
    }
    public equals(o: Move): boolean {
        throw new Error('Method not implemented.');
    }
    public encode(): number {
        throw new Error('Method not implemented.');
    }
    public decode(encodedMove: number): Move {
        throw new Error('Method not implemented.');
    }
}
