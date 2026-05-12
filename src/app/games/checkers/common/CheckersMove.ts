import { ArrayUtils, Encoder, MGPOptional, MGPUniqueList, Utils } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { Move } from '../../../jscaip/Move';

export class CheckersMove extends Move {

    private static of(coords: Coord[], isStep: boolean): CheckersMove {
        return new CheckersMove(coords, isStep);
    }

    public static fromCapture(coords: Coord[]): CheckersMove {
        return new CheckersMove(coords, false);
    }

    public static fromStep(start: Coord, end: Coord): CheckersMove {
        return new CheckersMove([start, end], true);
    }

    public static encoder: Encoder<CheckersMove> = Encoder.tuple(
        [Encoder.list(Coord.encoder), Encoder.identity<boolean>()],
        (move: CheckersMove) => [[...move.coords], move.isStep],
        (fields: [Coord[], boolean]) => CheckersMove.of(fields[0], fields[1]),
    );

    private constructor(public readonly coords: ReadonlyArray<Coord>, public readonly isStep: boolean) {
        super();
    }

    public override toString(): string {
        const coordStrings: string[] = this.coords.map((coord: Coord) => coord.toString());
        const coordString: string = coordStrings.join(', ');
        if (this.isStep) {
            return 'CheckersStep(' + coordString + ')';
        } else {
            return 'CheckersCapture(' + coordString + ')';
        }
    }

    private getRelation(other: CheckersMove): 'EQUALITY' | 'PREFIX' | 'INEQUALITY' {
        return CheckersMove.getRelation(this.coords, other.coords);
    }

    public static getRelation(a: ReadonlyArray<Coord>, b: ReadonlyArray<Coord>): 'EQUALITY' | 'PREFIX' | 'INEQUALITY' {
        const thisLength: number = a.length;
        const otherLength: number = b.length;
        if (thisLength > otherLength) {
            return 'INEQUALITY';
        }
        const minimalLength: number = Math.min(thisLength, otherLength);
        for (let i: number = 0; i < minimalLength; i++) {
            if (a[i].equals(b[i]) === false) return 'INEQUALITY';
        }
        if (thisLength === otherLength) return 'EQUALITY';
        else return 'PREFIX';
    }

    public equals(other: CheckersMove): boolean {
        return this.getRelation(other) === 'EQUALITY';
    }

    // If one of the two is prefix to the other ?
    public isPrefix(other: CheckersMove): boolean {
        return this.getRelation(other) === 'PREFIX';
    }

    public getStartingCoord(): Coord {
        return this.coords[0];
    }

    public getEndingCoord(): Coord {
        return this.coords[this.coords.length - 1];
    }

    public getSteppedOverCoordsWithDuplicates(): Coord[] {
        let lastCoordOpt: MGPOptional<Coord> = MGPOptional.empty();
        const allJumpedOverCoords: Coord[] = [];
        for (const coord of this.coords) {
            if (lastCoordOpt.isPresent()) {
                const lastCoord: Coord = lastCoordOpt.get();
                const subJumpedOverCoords: Coord[] = lastCoord.getCoordsToward(coord);
                for (const jumpedOverCoord of subJumpedOverCoords) {
                    allJumpedOverCoords.push(jumpedOverCoord);
                }
            }
            allJumpedOverCoords.push(coord);
            lastCoordOpt = MGPOptional.of(coord);
        }
        return allJumpedOverCoords;
    }

    public getSteppedOverCoords(): MGPUniqueList<Coord> {
        return new MGPUniqueList(this.getSteppedOverCoordsWithDuplicates());
    }

    public concatenate(move: CheckersMove): CheckersMove {
        const lastLandingOfFirstMove: Coord = this.getEndingCoord();
        const startOfSecondMove: Coord = move.coords[0];
        Utils.assert(lastLandingOfFirstMove.equals(startOfSecondMove), 'should not concatenate non-touching move');
        const firstPart: Coord[] = [...this.coords];
        const secondPart: Coord[] = [...move.coords].slice(1);
        return CheckersMove.fromCapture(firstPart.concat(secondPart));
    }

}
