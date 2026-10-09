import { Encoder, MGPOptional, MGPUniqueList, Utils } from '@everyboard/lib';

import { Coord } from '../../../jscaip/Coord';
import { Move } from '../../../jscaip/Move';

export class CheckersMove extends Move {

    private static of(coords: MGPUniqueList<Coord>, isStep: boolean): CheckersMove {
        return new CheckersMove(coords, isStep);
    }

    public static fromCapture(coords: MGPUniqueList<Coord>): CheckersMove {
        return new CheckersMove(coords, false);
    }

    public static fromCaptureList(coords: Coord[]): CheckersMove {
        return new CheckersMove(
            new MGPUniqueList(coords),
            false,
        );
    }

    public static fromStep(start: Coord, end: Coord): CheckersMove {
        return new CheckersMove(new MGPUniqueList([start, end]), true);
    }

    public static encoder: Encoder<CheckersMove> = Encoder.tuple(
        [Encoder.list(Coord.encoder), Encoder.identity<boolean>()],
        (move: CheckersMove) => [[...move.coords], move.isStep],
        (fields: [Coord[], boolean]) => CheckersMove.of(new MGPUniqueList(fields[0]), fields[1]),
    );

    private constructor(public readonly coords: MGPUniqueList<Coord>, public readonly isStep: boolean) {
        super();
    }

    public override toString(): string {
        const coordStrings: string[] = this.coords.map((coord: Coord) => coord.toString()).toList();
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

    public static getRelation(a: MGPUniqueList<Coord>, b: MGPUniqueList<Coord>): 'EQUALITY' | 'PREFIX' | 'INEQUALITY' {
        const thisLength: number = a.size();
        const otherLength: number = b.size();
        if (thisLength > otherLength) {
            return 'INEQUALITY';
        }
        const minimalLength: number = Math.min(thisLength, otherLength);
        for (let i: number = 0; i < minimalLength; i++) {
            if (a.get(i).equals(b.get(i)) === false) return 'INEQUALITY';
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
        return this.coords.getFromEnd(0);
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
        return CheckersMove.fromCaptureList(firstPart.concat(secondPart));
    }

}
