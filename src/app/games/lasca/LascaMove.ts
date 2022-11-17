import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert } from 'src/app/utils/assert';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPSet } from 'src/app/utils/MGPSet';

export class LascaMoveFailure {
    public static readonly CAPTURE_STEPS_MUST_BE_DOUBLE_DIAGONAL: Localized = () => $localize`TODOTODO capture must be double diagonal step`;
    public static readonly MOVE_STEP_MUST_BE_SINGLE_DIAGONAL: Localized = () => $localize`TODOTODO move must be single diagonal step`;
    public static readonly CANNOT_LEAVE_THE_BOARD: Localized = () => $localize`TODOTODO OUT OF RANGE COORD`;
    public static readonly CANNOT_CAPTURE_TWICE_THE_SAME_COORD: Localized = () => $localize`TODOTODO must not jump over the same coord several time`;
}

export class LascaMove extends Move {

    public toString(): string {
        throw new Error('toString not implemented.');
    }
    public equals(other: LascaMove): boolean {
        if (other.coords.length !== this.coords.length) return false;
        let i: number = 0;
        for (const coord of this.coords) {
            if (coord.equals(other.coords[i]) === false) return false;
            i++;
        }
        return true;
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
            if (coord.isNotInRange(7, 7)) {
                return MGPFallible.failure(LascaMoveFailure.CANNOT_LEAVE_THE_BOARD());
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
        if (start.isNotInRange(7, 7) || end.isNotInRange(7, 7)) {
            return MGPFallible.failure(LascaMoveFailure.CANNOT_LEAVE_THE_BOARD());
        }
        const vector: Coord = start.getVectorToward(end);
        if (Math.abs(vector.x) !== 1 || Math.abs(vector.y) !== 1) {
            return MGPFallible.failure(LascaMoveFailure.MOVE_STEP_MUST_BE_SINGLE_DIAGONAL());
        }
        return MGPFallible.success(new LascaMove([start, end], true));
    }
    private constructor(private readonly coords: Coord[], public readonly isStep: boolean) {
        super();
    }
    public getCoord(index: number): MGPFallible<Coord> {
        if (index < 0 || index >= this.coords.length) {
            return MGPFallible.failure('invalid index');
        }
        return MGPFallible.success(this.coords[index]);
    }
    public getStartingCoord(): Coord {
        return this.getCoord(0).get();
    }
    public getEndingCoord(): Coord {
        return this.coords[this.coords.length - 1];
    }
    public getSteppedOverCoords(): MGPFallible<MGPSet<Coord>> {
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
