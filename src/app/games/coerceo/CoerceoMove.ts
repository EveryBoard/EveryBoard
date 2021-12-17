import { Coord } from 'src/app/jscaip/Coord';
import { Direction, Vector } from 'src/app/jscaip/Direction';
import { NumberEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { CoerceoFailure } from './CoerceoFailure';

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

    public toInt(): number {
        return CoerceoStep.STEPS.findIndex((s: CoerceoStep) => s.direction.equals(this.direction));
    }
    public equals(other: CoerceoStep): boolean {
        return this === other;
    }
    public toString(): string {
        return this.str;
    }
}

export class CoerceoMove extends Move {
    public static encoder: NumberEncoder<CoerceoMove> = new class extends NumberEncoder<CoerceoMove> {
        public maxValue(): number {
            return 6*150 + 9*14 + 9;
        }
        public encodeNumber(move: CoerceoMove): number {
            // tileExchange: cx, cy
            // deplacements: step, cx, cy
            if (move.isTileExchange()) {
                const cy: number = move.capture.get().y; // [0, 9]
                const cx: number = move.capture.get().x; // [0, 14]
                return (cx * 10) + cy;
            } else {
                const cy: number = move.start.get().y; // [0, 9]
                const cx: number = move.start.get().x; // [0, 14]
                const step: number = move.step.get().toInt() + 1; // [1, 6]
                return (step * 150) + (cx * 10) + cy;
            }
        }
        public decodeNumber(encodedMove: number): CoerceoMove {
            if (encodedMove % 1 !== 0) {
                throw new Error('EncodedMove must be an integer.');
            }
            const cy: number = encodedMove % 10;
            encodedMove = (encodedMove - cy) / 10;
            const cx: number = encodedMove % 15;
            encodedMove = (encodedMove - cx) / 15;
            if (encodedMove === 0) {
                return CoerceoMove.fromTilesExchange(new Coord(cx, cy));
            } else {
                return CoerceoMove.fromDeplacement(new Coord(cx, cy), CoerceoStep.STEPS[encodedMove - 1]);
            }
        }
    }
    public static fromDeplacement(start: Coord,
                                  step: CoerceoStep): CoerceoMove
    {
        if (start.isNotInRange(15, 10)) {
            throw new Error('Starting coord cannot be out of range (width: 15, height: 10).');
        }
        const landingCoord: Coord = new Coord(start.x + step.direction.x, start.y + step.direction.y);
        if (landingCoord.isNotInRange(15, 10)) {
            throw new Error('Landing coord cannot be out of range (width: 15, height: 10).');
        }
        return new CoerceoMove(MGPOptional.of(start),
                               MGPOptional.of(step),
                               MGPOptional.of(landingCoord),
                               MGPOptional.empty());
    }
    public static fromTilesExchange(capture: Coord): CoerceoMove {
        if (capture.isNotInRange(15, 10)) {
            throw new Error('Captured coord cannot be out of range (width: 15, height: 10).');
        }
        return new CoerceoMove(MGPOptional.empty(),
                               MGPOptional.empty(),
                               MGPOptional.empty(),
                               MGPOptional.of(capture));
    }
    public static fromCoordToCoord(start: Coord, end: Coord): CoerceoMove {
        const step: CoerceoStep = CoerceoStep.fromCoords(start, end);
        return CoerceoMove.fromDeplacement(start, step);
    }
    private constructor(public readonly start: MGPOptional<Coord>,
                        public readonly step: MGPOptional<CoerceoStep>,
                        public readonly landingCoord: MGPOptional<Coord>,
                        public readonly capture: MGPOptional<Coord>)
    {
        super();
    }
    public isTileExchange(): boolean {
        return this.capture.isPresent();
    }
    public toString(): string {
        if (this.isTileExchange()) {
            return 'CoerceoMove(' + this.capture.get().toString() + ')';
        } else {
            return 'CoerceoMove(' + this.start.get().toString() + ' > ' +
                   this.step.get().toString() + ' > ' +
                   this.landingCoord.get().toString() + ')';
        }
    }
    public equals(o: CoerceoMove): boolean {
        if (!this.capture.equals(o.capture)) return false;
        if (!this.start.equals(o.start)) return false;
        if (!this.step.equals(o.step)) return false;
        return true;
    }
}
