import { Coord, CoordFailure } from 'src/app/jscaip/Coord';
import { Vector } from 'src/app/jscaip/Vector';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { MoveEncoder } from 'src/app/utils/Encoder';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';
import { JSONObject, JSONValue, JSONValueWithoutArray, Utils } from 'src/app/utils/utils';
import { LascaFailure } from './LascaFailure';
import { LascaState } from './LascaState';

export class LascaMove extends Move {

    public static fromCapture(coords: Coord[]): MGPFallible<LascaMove> {
        const jumpsValidity: MGPFallible<MGPSet<Coord>> = LascaMove.getSteppedOverCoords(coords);
        if (jumpsValidity.isSuccess()) {
            return MGPFallible.success(new LascaMove(coords, false));
        } else {
            return MGPFallible.failure(jumpsValidity.getReason());
        }
    }
    public static getSteppedOverCoords(steppedOn: Coord[]): MGPFallible<MGPSet<Coord>> {
        let lastCoordOpt: MGPOptional<Coord> = MGPOptional.empty();
        const jumpedOverCoords: MGPSet<Coord> = new MGPSet();
        for (const coord of steppedOn) {
            if (LascaState.isNotOnBoard(coord)) {
                return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(coord));
            }
            if (lastCoordOpt.isPresent()) {
                const lastCoord: Coord = lastCoordOpt.get();
                const vector: Vector = lastCoord.getVectorToward(coord);
                if (vector.isDiagonalOfLength(2) === false) {
                    return MGPFallible.failure(LascaFailure.CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL());
                }
                const jumpedOverCoord: Coord = lastCoord.getCoordsToward(coord)[0];
                if (jumpedOverCoords.contains(jumpedOverCoord)) {
                    return MGPFallible.failure(LascaFailure.CANNOT_CAPTURE_TWICE_THE_SAME_COORD());
                }
                jumpedOverCoords.add(jumpedOverCoord);
            }
            lastCoordOpt = MGPOptional.of(coord);
        }
        return MGPFallible.success(jumpedOverCoords);
    }
    public static fromStep(start: Coord, end: Coord): MGPFallible<LascaMove> {
        if (LascaState.isNotOnBoard(start)) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(start));
        }
        if (LascaState.isNotOnBoard(end)) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(end));
        }
        const vector: Vector = start.getVectorToward(end);
        if (vector.isDiagonalOfLength(1) === false) {
            return MGPFallible.failure(LascaFailure.MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL());
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
            if (this.coords.toList()[i].equals(other.coords.toList()[i]) === false) return 'INEQUALITY';
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
        return MGPFallible.success(this.coords.toList()[index]);
    }
    public getStartingCoord(): Coord {
        return this.getCoord(0).get();
    }
    public getEndingCoord(): Coord {
        const list: Coord[] = this.coords.toList();
        const last: number = list.length - 1;
        return list[last];
    }
    public getCapturedCoords(): MGPFallible<MGPSet<Coord>> {
        return LascaMove.getSteppedOverCoords(this.coords.toList());
    }
    public concatenate(move: LascaMove): LascaMove {
        const lastLandingOfFirstMove: Coord = this.getEndingCoord();
        const startOfSecondMove: Coord = move.coords.toList()[0];
        assert(lastLandingOfFirstMove.equals(startOfSecondMove), 'should not concatenate non-touching move');
        const firstPart: Coord[] = ArrayUtils.copyImmutableArray(this.coords.toList());
        const secondPart: Coord[] = ArrayUtils.copyImmutableArray(move.coords.toList()).slice(1);
        return LascaMove.fromCapture(firstPart.concat(secondPart)).get();
    }
}
