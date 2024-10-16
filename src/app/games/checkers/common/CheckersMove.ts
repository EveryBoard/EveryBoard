import { Coord } from 'src/app/jscaip/Coord';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils, Encoder, MGPFallible, MGPOptional, MGPUniqueList, Utils } from '@everyboard/lib';
import { CheckersFailure } from './CheckersFailure';
import { CoordSet } from 'src/app/jscaip/CoordSet';

export class CheckersMove extends Move {

    private static of(coords: Coord[], isStep: boolean): CheckersMove {
        return new CheckersMove(coords, isStep);
    }

    public static fromCapture(coords: Coord[]): MGPFallible<CheckersMove> {
        const jumpsValidity: MGPFallible<CoordSet> = CheckersMove.getSteppedOverCoords(coords);
        if (jumpsValidity.isSuccess()) {
            return MGPFallible.success(new CheckersMove(coords, false));
        } else {
            return MGPFallible.failure(jumpsValidity.getReason());
        }
    }

    public static getSteppedOverCoords(steppedOn: Coord[]): MGPFallible<CoordSet> {
        let lastCoordOpt: MGPOptional<Coord> = MGPOptional.empty();
        let jumpedOverCoords: CoordSet = new CoordSet([steppedOn[0]]);
        for (const coord of steppedOn) {
            if (lastCoordOpt.isPresent()) {
                const lastCoord: Coord = lastCoordOpt.get();
                const subJumpedOverCoords: Coord[] = lastCoord.getCoordsToward(coord).concat([coord]);
                for (const jumpedOverCoord of subJumpedOverCoords) {
                    if (jumpedOverCoords.contains(jumpedOverCoord)) {
                        return MGPFallible.failure(CheckersFailure.CANNOT_CAPTURE_TWICE_THE_SAME_COORD());
                    }
                    jumpedOverCoords = jumpedOverCoords.addElement(jumpedOverCoord);
                }
            }
            lastCoordOpt = MGPOptional.of(coord);
        }
        return MGPFallible.success(jumpedOverCoords);
    }

    public static fromStep(start: Coord, end: Coord): CheckersMove {
        return new CheckersMove([start, end], true);
    }

    public static encoder: Encoder<CheckersMove> = Encoder.tuple(
        [Encoder.list(Coord.encoder), Encoder.identity<boolean>()],
        (move: CheckersMove) => [move.coords.toList(), move.isStep],
        (fields: [Coord[], boolean]) => CheckersMove.of(fields[0], fields[1]),
    );

    public readonly coords: MGPUniqueList<Coord>;

    private constructor(coords: Coord[], public readonly isStep: boolean) {
        super();
        this.coords = new MGPUniqueList(coords);
    }

    public override toString(): string {
        const coordStrings: string[] = this.coords.toList().map((coord: Coord) => coord.toString());
        const coordString: string = coordStrings.join(', ');
        return 'CheckersMove(' + coordString + ')';
    }

    private getRelation(other: CheckersMove): 'EQUALITY' | 'PREFIX' | 'INEQUALITY' {
        const thisLength: number = this.coords.size();
        const otherLength: number = other.coords.size();
        const minimalLength: number = Math.min(thisLength, otherLength);
        for (let i: number = 0; i < minimalLength; i++) {
            if (this.coords.toList()[i].equals(other.coords.toList()[i]) === false) return 'INEQUALITY';
        }
        if (thisLength === otherLength) return 'EQUALITY';
        else return 'PREFIX';
    }

    public equals(other: CheckersMove): boolean {
        return this.getRelation(other) === 'EQUALITY';
    }

    public isPrefix(other: CheckersMove): boolean {
        return this.getRelation(other) === 'PREFIX';
    }

    public getStartingCoord(): Coord {
        return this.coords.get(0);
    }

    public getEndingCoord(): Coord {
        return this.coords.getFromEnd(0);
    }

    public getSteppedOverCoords(): MGPFallible<CoordSet> {
        return CheckersMove.getSteppedOverCoords(this.coords.toList());
    }

    public concatenate(move: CheckersMove): CheckersMove {
        const lastLandingOfFirstMove: Coord = this.getEndingCoord();
        const startOfSecondMove: Coord = move.coords.toList()[0];
        Utils.assert(lastLandingOfFirstMove.equals(startOfSecondMove), 'should not concatenate non-touching move');
        const thisCoordList: Coord[] = this.coords.toList();
        const firstPart: Coord[] = ArrayUtils.copy(thisCoordList);
        const otherCoordList: Coord[] = move.coords.toList();
        const secondPart: Coord[] = ArrayUtils.copy(otherCoordList).slice(1);
        return CheckersMove.fromCapture(firstPart.concat(secondPart)).get();
    }

}
