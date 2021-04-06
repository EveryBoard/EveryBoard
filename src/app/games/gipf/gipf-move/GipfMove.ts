import { Coord } from 'src/app/jscaip/coord/Coord';
import { Encoder } from 'src/app/jscaip/encoder';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { HexaLine } from 'src/app/jscaip/hexa/HexaLine';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { assert, JSONObject, JSONValue } from 'src/app/utils/collection-lib/utils';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

export class GipfCapture {
    // Encodes a capture as: initial case, direction, length
    public static encoder: Encoder<GipfCapture> = new class extends Encoder<GipfCapture> {
        public encode(capture: GipfCapture): JSONValue {
            return capture.capturedCases.map((coord: Coord): JSONValue => Coord.encoder.encode(coord));
        }
        public decode(encoded: JSONValue): GipfCapture {
            const casted: Array<JSONValue> = encoded as Array<JSONValue>;
            return new GipfCapture(casted.map((x: JSONValue) => Coord.encoder.decode(x)));
        }
    }

    public readonly capturedCases: ReadonlyArray<Coord>;

    public constructor(captured: ReadonlyArray<Coord>) {
        if (captured.length < 4) {
            throw new Error('Cannot create a GipfCapture with less than 4 captured pieces');
        }
        if (HexaLine.areOnSameLine(captured) === false) {
            throw new Error('Cannot create a GipfCapture with pieces that are not on the same line');
        }
        this.capturedCases = ArrayUtils.copyImmutableArray(captured).sort((coord1: Coord, coord2: Coord) => {
            if (coord1.x === coord2.x) {
                if (coord1.y === coord2.y) {
                    throw new Error('Cannot create a GipfCapture with duplicate cases');
                }
                return coord1.y > coord2.y ? 1 : -1;
            } else {
                return coord1.x > coord2.x ? 1 : -1;
            }
        });
    }
    public toString(): string {
        let str: string = '';
        for (const coord of this.capturedCases) {
            if (str !== '') {
                str += ',';
            }
            str += coord.toString();
        }
        return str;
    }
    public size(): number {
        return this.capturedCases.length;
    }
    public forEach(callback: (coord: Coord) => void): void {
        this.capturedCases.forEach(callback);
    }
    public contains(coord: Coord): boolean {
        for (let i: number = 0; i < this.capturedCases.length; i++) {
            if (this.capturedCases[i].equals(coord)) {
                return true;
            }
        }
        return false;
    }
    public intersectsWith(capture: GipfCapture): boolean {
        return this.capturedCases.some((coord: Coord) => {
            return capture.contains(coord);
        });
    }
    public getLine(): HexaLine {
        const line: MGPOptional<HexaLine> = HexaLine.fromTwoCoords(this.capturedCases[0], this.capturedCases[1]);
        // Invariant: all captured pieces are on the same line, hence we can safely call .get()
        return line.get();
    }
    public equals(other: GipfCapture): boolean {
        if (this === other) return true;
        if (this.capturedCases.length !== other.capturedCases.length) return false;
        for (let i: number = 0; i < this.capturedCases.length; i++) {
            if (!this.capturedCases[i].equals(other.capturedCases[i])) return false;
        }
        return true;
    }
}

export class GipfPlacement {
    public static encoder: Encoder<GipfPlacement> = new class extends Encoder<GipfPlacement> {
        public optionalDirectionEncoder: Encoder<MGPOptional<HexaDirection>> =
            MGPOptional.encoder(HexaDirection.encoder);
        public encode(placement: GipfPlacement): JSONValue {
            return {
                coord: Coord.encoder.encode(placement.coord),
                direction: this.optionalDirectionEncoder.encode(placement.direction),
            };
        }
        public decode(encoded: JSONValue): GipfPlacement {
            const casted: JSONObject = encoded as JSONObject;
            assert(casted.coord != null, 'Invalid encoded GipfPlacement');
            return new GipfPlacement(Coord.encoder.decode(casted.coord),
                                     this.optionalDirectionEncoder.decode(casted.direction));
        }
    }
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
        if (!this.coord.equals(other.coord)) return false;
        const cmpDir: (x: HexaDirection, y: HexaDirection) => boolean =
            (x: HexaDirection, y: HexaDirection): boolean => {
                return x === y;
            };
        if (this.direction.equals(other.direction, cmpDir) === false) return false;
        return true;
    }
}

export class GipfMove extends Move {
    public static encoder: Encoder<GipfMove> = new class extends Encoder<GipfMove> {
        public encode(move: GipfMove): JSONValue {
            return {
                placement: GipfPlacement.encoder.encode(move.placement),
                initialCaptures: move.initialCaptures.map(GipfCapture.encoder.encode),
                finalCaptures: move.finalCaptures.map(GipfCapture.encoder.encode),
            };
        }
        public decode(encoded: JSONValue): GipfMove {
            const casted: JSONObject = encoded as JSONObject;
            assert(casted.placement != null && casted.initialCaptures != null && casted.finalCaptures != null,
                   'Invalid encoded GipfMove');
            return new GipfMove(GipfPlacement.encoder.decode(casted.placement),
                                (casted.initialCaptures as Array<JSONValue>).map(GipfCapture.encoder.decode),
                                (casted.finalCaptures as Array<JSONValue>).map(GipfCapture.encoder.decode));
        }
    }

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
        if (this.captureEquals(this.initialCaptures, other.initialCaptures) === false) return false;
        if (this.captureEquals(this.finalCaptures, other.finalCaptures) === false) return false;
        return true;
    }
    private captureEquals(c1: ReadonlyArray<GipfCapture>, c2: ReadonlyArray<GipfCapture>): boolean {
        if (c1.length !== c2.length) return false;
        for (let i: number = 0; i < c1.length; i++) {
            if (c1[i].equals(c2[i]) === false) return false;
        }
        return true;
    }
    public encode(): JSONValue {
        return GipfMove.encoder.encode(this);
    }
    public decode(encodedMove: JSONValue): GipfMove {
        return GipfMove.encoder.decode(encodedMove);
    }
}

