import { Coord } from 'src/app/jscaip/Coord';
import { Encoder } from 'src/app/utils/Encoder';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexaLine } from 'src/app/jscaip/HexaLine';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Utils } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class GipfCapture {

    public static encoder: Encoder<GipfCapture> = Encoder.tuple(
        [Encoder.list<Coord>(Coord.encoder)],
        (move: GipfCapture): [ReadonlyArray<Coord>] => [move.capturedSpaces],
        (fields: [Coord[]]): GipfCapture => new GipfCapture(fields[0]),
    );
    public static listEncoder: Encoder<ReadonlyArray<GipfCapture>> = Encoder.list(GipfCapture.encoder);

    public readonly capturedSpaces: ReadonlyArray<Coord>;

    public constructor(captured: ReadonlyArray<Coord>) {
        Utils.assert(captured.length >= 4, 'Cannot create a GipfCapture with less than 4 captured pieces');
        Utils.assert(HexaLine.areOnSameLine(captured), 'Cannot create a GipfCapture with pieces that are not on the same line');
        this.capturedSpaces = ArrayUtils.copyImmutableArray(captured).sort((coord1: Coord, coord2: Coord) => {
            if (coord1.x === coord2.x) {
                Utils.assert(coord1.y !== coord2.y, 'Cannot create a GipfCapture with duplicate coords');
                return coord1.y > coord2.y ? 1 : -1;
            } else {
                return coord1.x > coord2.x ? 1 : -1;
            }
        });
        let previous: MGPOptional<Coord> = MGPOptional.empty();
        // Captured coords must be consecutive
        for (const coord of this.capturedSpaces) {
            Utils.assert(previous.isAbsent() || previous.get().getDistance(coord) === 1,
                         'Cannot create a GipfCapture with non-consecutive coords');
            previous = MGPOptional.of(coord);
        }
    }
    public toString(): string {
        let str: string = '';
        for (const coord of this.capturedSpaces) {
            if (str !== '') {
                str += ',';
            }
            str += coord.toString();
        }
        return str;
    }
    public size(): number {
        return this.capturedSpaces.length;
    }
    public forEach(callback: (coord: Coord) => void): void {
        this.capturedSpaces.forEach(callback);
    }
    public contains(coord: Coord): boolean {
        for (let i: number = 0; i < this.capturedSpaces.length; i++) {
            if (this.capturedSpaces[i].equals(coord)) {
                return true;
            }
        }
        return false;
    }
    public intersectsWith(capture: GipfCapture): boolean {
        return this.capturedSpaces.some((coord: Coord) => {
            return capture.contains(coord);
        });
    }
    public getLine(): HexaLine {
        const line: MGPOptional<HexaLine> = HexaLine.fromTwoCoords(this.capturedSpaces[0], this.capturedSpaces[1]);
        // Invariant: all captured pieces are on the same line, hence we can safely call .get()
        return line.get();
    }
    public equals(other: GipfCapture): boolean {
        if (this === other) return true;
        if (this.capturedSpaces.length !== other.capturedSpaces.length) {
            return false;
        }
        for (let i: number = 0; i < this.capturedSpaces.length; i++) {
            if (this.capturedSpaces[i].equals(other.capturedSpaces[i]) === false) {
                return false;
            }
        }
        return true;
    }
}

type GipfPlacementFields = [Coord, MGPOptional<HexaDirection>];

export class GipfPlacement {

    public static encoder: Encoder<GipfPlacement> = Encoder.tuple(
        [Coord.encoder, MGPOptional.getEncoder(HexaDirection.encoder)],
        (placement: GipfPlacement): GipfPlacementFields => [placement.coord, placement.direction],
        (fields: GipfPlacementFields): GipfPlacement => new GipfPlacement(fields[0], fields[1]),
    );
    public constructor(public readonly coord: Coord,
                       public readonly direction: MGPOptional<HexaDirection>) {
    }
    public toString(): string {
        if (this.direction.isPresent()) {
            return this.coord.toString() + '@' + this.direction.get().toString();
        } else {
            return this.coord.toString();
        }
    }
    public equals(other: GipfPlacement): boolean {
        if (this.coord.equals(other.coord) === false) {
            return false;
        }
        return this.direction.equals(other.direction);
    }
}

type GipfMoveFields = [GipfPlacement, Array<GipfCapture>, Array<GipfCapture>];

export class GipfMove extends Move {

    public static encoder: Encoder<GipfMove> = Encoder.tuple(
        [GipfPlacement.encoder, GipfCapture.listEncoder, GipfCapture.listEncoder],
        (move: GipfMove) => [move.placement, move.initialCaptures, move.finalCaptures],
        (fields: GipfMoveFields) => new GipfMove(fields[0], fields[1], fields[2]),
    );
    public constructor(public readonly placement: GipfPlacement,
                       public readonly initialCaptures: ReadonlyArray<GipfCapture>,
                       public readonly finalCaptures: ReadonlyArray<GipfCapture>) {
        super();
    }
    public toString(): string {
        return 'GipfMove([' +
            this.capturesToString(this.initialCaptures) + '], ' +
            this.placement.toString() + ', [' +
            this.capturesToString(this.finalCaptures) + '])';
    }
    private capturesToString(captures: ReadonlyArray<GipfCapture>): string {
        let str: string = '';
        for (const capture of captures) {
            if (str !== '') {
                str += ',';
            }
            str += '[' + capture.toString() + ']';
        }
        return str;
    }
    public equals(other: GipfMove): boolean {
        if (this === other) return true;
        if (this.placement.equals(other.placement) === false) return false;
        if (ArrayUtils.compareArray(this.initialCaptures, other.initialCaptures) === false) return false;
        if (ArrayUtils.compareArray(this.finalCaptures, other.finalCaptures) === false) return false;
        return true;
    }
}
