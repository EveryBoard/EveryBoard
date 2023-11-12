import {Coord, CoordFailure} from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { Encoder } from 'src/app/utils/Encoder';
import {ArrayUtils, Table} from "../../utils/ArrayUtils";
import {MGPUniqueList} from "../../utils/MGPUniqueList";
import { types } from "sass";
import List = types.List;
import {publish} from "rxjs";
import {MGPFallible} from "../../utils/MGPFallible";
import {LascaState} from "../lasca/LascaState";
import {Vector} from "../../jscaip/Vector";
import {LascaFailure} from "../lasca/LascaFailure";
import {MGPSet} from "../../utils/MGPSet";
import {MGPOptional} from "../../utils/MGPOptional";
import {assert} from "../../utils/assert";

/**
  * This class represents the moves of your game.
  * In most cases, your moves into one of the following categories, already implemented by the class of the same name:
  *   - `MoveCoord`: for moves that consist of selecting only a single space (e.g., dropping a piece on a board)
  *   - `MoveCoordToCoord`: for moves that consist of moving from one space to another
  *   - `MoveWithTwoCoords`: for moves that affect two spaces, but are not moves from one to the other.
  * All move must extends the `Move` parent class
  */
export class DraughtMove extends Move {
    /*
     * A move needs an Encoder to be able to play online.
     * There are multiple helpers to create encoders.
     * You'll likely be interested in:
     *   - `MoveCoord.getEncoder` and `MoveWithTwoCoords` to get an encoder for a move of the corresponding type.
     *   - `MoveEncoder.tuple` to get an encoder for a move that has multiple fields
     *   - `MoveEncoder.disjunction` to get an encoder for a move that may be of different types
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    // TODO for review (should apply non unique list (set) to lasca too)

    public static of(coords: Coord[]): DraughtMove {
        return new DraughtMove(coords);
    }

    public static fromCapture(coords: Coord[]): MGPFallible<DraughtMove> {
        const jumpsValidity: MGPFallible<MGPSet<Coord>> = DraughtMove.getSteppedOverCoords(coords);
        if (jumpsValidity.isSuccess()) {
            return MGPFallible.success(new DraughtMove(coords));
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
    public static fromStep(start: Coord, end: Coord): MGPFallible<DraughtMove> {
        if (LascaState.isNotOnBoard(start)) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(start));
        }
        if (LascaState.isNotOnBoard(end)) {
            return MGPFallible.failure(CoordFailure.OUT_OF_RANGE(end));
        }
        const vector: Vector = start.getVectorToward(end);
        if (vector.toMinimalVector().isDiagonalOfLength(1) === false) {
            return MGPFallible.failure(LascaFailure.MOVE_STEPS_MUST_BE_SINGLE_DIAGONAL());
        }
        return MGPFallible.success(new DraughtMove([start, end]));
    }

    public static encoder: Encoder<DraughtMove> = Encoder.tuple(
        [Encoder.list(Coord.encoder)],
        (move: DraughtMove) => [move.coords],
        (fields: [Coord[]]) => DraughtMove.of(fields[0]),
    );

    private constructor(public readonly coords: ReadonlyArray<Coord>) {
        super();
    }

    public override toString(): string {
        const coordStrings: string[] = this.coords.map(Coord.toString);
        const coordString: string = coordStrings.join(', ');
        return 'DraughtMove(' + coordString + ')';
    }

    private getRelation(other: DraughtMove): 'EQUALITY' | 'PREFIX' | 'INEQUALITY' {
        const thisLength: number = this.coords.length;
        const otherLength: number = other.coords.length;
        const minimalLength: number = Math.min(thisLength, otherLength);
        for (let i: number = 0; i < minimalLength; i++) {
            if (this.coords[i].equals(other.coords[i]) === false) return 'INEQUALITY';
        }
        if (thisLength === otherLength) return 'EQUALITY';
        else return 'PREFIX';
    }
    public equals(other: this): boolean {
        return this.getRelation(other) === "EQUALITY";
    }

    public isPrefix(other: DraughtMove): boolean {
        return this.getRelation(other) === 'PREFIX';
    }

    public getStartingCoord(): Coord {
        return this.coords[0];
    }

    public getEndingCoord(): Coord {
        return this.coords[0];
    }

    public getCapturedCoords(): MGPFallible<MGPSet<Coord>> {
        return DraughtMove.getSteppedOverCoords(this.coords);
    }

    public concatenate(move: DraughtMove): DraughtMove {
        const lastLandingOfFirstMove: Coord = this.getEndingCoord();
        const startOfSecondMove: Coord = move.coords[0];
        assert(lastLandingOfFirstMove.equals(startOfSecondMove), 'should not concatenate non-touching move');
        const thisCoordList: Coord[] = this.coords;
        const firstPart: Coord[] = ArrayUtils.copyImmutableArray(thisCoordList);
        const otherCoordList: Coord[] = move.coords;
        const secondPart: Coord[] = ArrayUtils.copyImmutableArray(otherCoordList).slice(1);
        return DraughtMove.fromCapture(firstPart.concat(secondPart)).get();
    }
}
