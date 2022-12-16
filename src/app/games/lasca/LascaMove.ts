import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { JSONObject, JSONValue, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { LascaState } from './LascaState';

export class LascaMoveFailure {

    public static readonly CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL: Localized = () => $localize`Capture must be double diagonal steps!`;

    public static readonly MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL: Localized = () => $localize`Move must be single diagonal steps!`;

    public static readonly CANNOT_CAPTURE_TWICE_THE_SAME_COORD: Localized = () => $localize`You cannot jump over the same space several times!`;
}

export class LascaMove extends Move {

    public static isNotInRange(coord: Coord): boolean {
        return coord.isNotInRange(LascaState.SIZE, LascaState.SIZE);
    }
    public static isInRange(coord: Coord): boolean {
        return coord.isInRange(LascaState.SIZE, LascaState.SIZE);
    }
    public static fromCapture(coords: Coord[]): MGPFallible<LascaMove> {
        const jumpsValidity: MGPFallible<MGPSet<Coord>> = LascaMove.getSteppedOverCoords(coords);
        if (jumpsValidity.isSuccess()) {
            return MGPFallible.success(new LascaMove(coords, false));
        } else {
            return MGPFallible.failure(jumpsValidity.getReason());
        }
    }
    public static getSteppedOverCoords(coords: Coord[]): MGPFallible<MGPSet<Coord>> {
        let lastCoordOpt: MGPOptional<Coord> = MGPOptional.empty();
        const jumpedOverCoords: MGPSet<Coord> = new MGPSet();
        for (const coord of coords) {
            if (LascaMove.isNotInRange(coord)) {
                return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(coord));
            }
            if (lastCoordOpt.isPresent()) {
                const lastCoord: Coord = lastCoordOpt.get();
                const vector: Coord = lastCoord.getVectorToward(coord);
                if (Math.abs(vector.x) !== 2 || Math.abs(vector.y) !== 2) {
                    return MGPFallible.failure(LascaMoveFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());
                }
                const jumpedOverCoord: Coord = lastCoord.getCoordsToward(coord)[0];
                if (jumpedOverCoords.contains(jumpedOverCoord)) {
                    return MGPFallible.failure(LascaMoveFailure.CANNOT_CAPTURE_TWICE_THE_SAME_COORD());
                }
                jumpedOverCoords.add(jumpedOverCoord);
            }
            lastCoordOpt = MGPOptional.of(coord);
        }
        return MGPFallible.success(jumpedOverCoords);
    }
    public static fromStep(start: Coord, end: Coord): MGPFallible<LascaMove> {
        if (LascaMove.isNotInRange(start)) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(start));
        }
        if (LascaMove.isNotInRange(end)) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(end));
        }
        const vector: Coord = start.getVectorToward(end);
        if (Math.abs(vector.x) !== 1 || Math.abs(vector.y) !== 1) {
            return MGPFallible.failure(LascaMoveFailure.MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL());
        }
        return MGPFallible.success(new LascaMove([start, end], true));
    }
    public static encoder: MoveEncoder<LascaMove> = new class extends MoveEncoder<LascaMove> {
        public encodeMove(move: LascaMove): JSONValueWithoutArray {
            return {
                coords: move.coords.map((coord: Coord): JSONValueWithoutArray => {
                    return Coord.encoder.encode(coord) as JSONValueWithoutArray;
                }),
                isStep: move.isStep,
            };
        }
        public decodeMove(encoded: JSONValueWithoutArray): LascaMove {
            const casted: JSONObject = encoded as JSONObject;
            assert(casted.coords != null, 'Encoded LascaMove should have a coords field');
            assert(casted.isStep != null, 'Encoded LascaMove should have a isStep field');
            const encodedCoords: JSONValueWithoutArray[] =
                Utils.getNonNullable(casted.coords) as JSONValueWithoutArray[];
            const coords: Coord[] = encodedCoords.map((x: JSONValue) => Coord.encoder.decode(x));
            return new LascaMove(coords, casted.isStep as boolean);
        }
    };
    private constructor(private readonly coords: Coord[], public readonly isStep: boolean) {
        super();
    }
    public toString(): string {
        const coords: Coord[] = this.coords;
        const coordStrings: string[] = coords.map((coord: Coord) => coord.toString());
        const coordString: string = coordStrings.join(', ');
        return 'LascaMove(' + coordString + ')';
    }
    public equals(other: LascaMove): boolean {
        return this.getRelation(other) === 'EQUALITY';
    }
    public getRelation(other: LascaMove): 'EQUALITY' | 'PREFIX' | 'INEQUALITY' {
        const thisLength: number = this.coords.length;
        const otherLength: number = other.coords.length;
        const minimalLength: number = Math.min(thisLength, otherLength);
        for (let i: number = 0; i < minimalLength; i++) {
            if (this.coords[i].equals(other.coords[i]) === false) return 'INEQUALITY';
        }
        if (thisLength === otherLength) return 'EQUALITY';
        else return 'PREFIX';
    }
    public getCoord(index: number): MGPFallible<Coord> {
        if (index < 0 || index >= this.coords.length) {
            return MGPFallible.failure('invalid index');
        }
        return MGPFallible.success(this.coords[index]);
    }
    public getCoordsCopy(): Coord[] {
        return ArrayUtils.copyImmutableArray(this.coords);
    }
    public getStartingCoord(): Coord {
        return this.getCoord(0).get();
    }
    public getEndingCoord(): Coord {
        return this.coords[this.coords.length - 1];
    }
    public getCapturedCoords(): MGPFallible<MGPSet<Coord>> {
        return LascaMove.getSteppedOverCoords(this.coords);
    }
    public concatene(move: LascaMove): LascaMove {
        const lastLandingOfFirstMove: Coord = this.getEndingCoord();
        const startOfSecondMove: Coord = move.coords[0];
        assert(lastLandingOfFirstMove.equals(startOfSecondMove), 'should not concatene non-touching move'); // je veux être ému!!!
        const firstPart: Coord[] = ArrayUtils.copyImmutableArray(this.coords);
        const secondPart: Coord[] = ArrayUtils.copyImmutableArray(move.coords).slice(1);
        return LascaMove.fromCapture(firstPart.concat(secondPart)).get();
    }
}
