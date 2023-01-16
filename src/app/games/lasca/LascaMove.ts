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

    public static readonly CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL: Localized = () => $localize`A capture should be a double diagonal step. Look at the green indicators to help you!`;

    public static readonly MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL: Localized = () => $localize`You must move in a single diagonal step!`;

    public static readonly CANNOT_CAPTURE_TWICE_THE_SAME_COORD: Localized = () => $localize`You cannot jump over the same square several times!`;
}

export class LascaMove extends Move {

    public static isNotOnBoard(coord: Coord): boolean {
        return coord.isNotInRange(LascaState.SIZE, LascaState.SIZE);
    }
    public static isOnBoard(coord: Coord): boolean {
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
            if (LascaMove.isNotOnBoard(coord)) {
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
        if (LascaMove.isNotOnBoard(start)) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(start));
        }
        if (LascaMove.isNotOnBoard(end)) {
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
                coords: move.coords.toList().map((coord: Coord): JSONValueWithoutArray => {
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
    public readonly coords: MGPSet<Coord>;

    private constructor(coords: Coord[], public readonly isStep: boolean) {
        super();
        this.coords = new MGPSet(coords);
    }
    public toString(): string {
        const coordStrings: string[] = this.coords.toList().map((coord: Coord) => coord.toString());
        const coordString: string = coordStrings.join(', ');
        return 'LascaMove(' + coordString + ')';
    }
    private getRelation(other: LascaMove): 'EQUALITY' | 'PREFIX' | 'INEQUALITY' {
        const thisLength: number = this.coords.size();
        const otherLength: number = other.coords.size();
        const minimalLength: number = Math.min(thisLength, otherLength);
        for (let i: number = 0; i < minimalLength; i++) {
            if (this.coords.getByIndex(i).equals(other.coords.getByIndex(i)) === false) return 'INEQUALITY';
        }
        if (thisLength === otherLength) return 'EQUALITY';
        else return 'PREFIX';
    }
    public equals(other: LascaMove): boolean {
        return this.getRelation(other) === 'EQUALITY';
    }
    public isPrefix(other: LascaMove): boolean {
        return this.getRelation(other) === 'PREFIX';
    }
    public getCoord(index: number): MGPFallible<Coord> {
        if (index < 0 || index >= this.coords.size()) {
            return MGPFallible.failure('invalid index');
        }
        return MGPFallible.success(this.coords.getByIndex(index));
    }
    public getStartingCoord(): Coord {
        return this.getCoord(0).get();
    }
    public getEndingCoord(): Coord {
        return this.coords.getByIndex(-1);
    }
    public getCapturedCoords(): MGPFallible<MGPSet<Coord>> {
        return LascaMove.getSteppedOverCoords(this.coords.toList());
    }
    public concatenate(move: LascaMove): LascaMove {
        const lastLandingOfFirstMove: Coord = this.getEndingCoord();
        const startOfSecondMove: Coord = move.coords.getByIndex(0);
        assert(lastLandingOfFirstMove.equals(startOfSecondMove), 'should not concatenate non-touching move');
        const firstPart: Coord[] = ArrayUtils.copyImmutableArray(this.coords.toList());
        const secondPart: Coord[] = ArrayUtils.copyImmutableArray(move.coords.toList()).slice(1);
        return LascaMove.fromCapture(firstPart.concat(secondPart)).get();
    }
}
