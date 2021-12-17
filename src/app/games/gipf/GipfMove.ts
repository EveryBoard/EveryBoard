import { Coord } from 'src/app/jscaip/Coord';
import { Encoder, MoveEncoder } from 'src/app/jscaip/Encoder';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { HexaLine } from 'src/app/jscaip/HexaLine';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { assert, JSONObject, JSONValue, JSONValueWithoutArray } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class GipfCapture {
    public static encoder: Encoder<GipfCapture> = new class extends Encoder<GipfCapture> {
        public encode(capture: GipfCapture): JSONValue {
            return capture.capturedCases.map((coord: Coord): JSONValueWithoutArray => {
                return Coord.encoder.encode(coord) as JSONValueWithoutArray;
            });
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
        let previous: MGPOptional<Coord> = MGPOptional.empty();
        // Captured cases must be consecutive
        for (const coord of this.capturedCases) {
            if (previous.isPresent() && previous.get().getDistance(coord) !== 1) {
                throw new Error('Cannot create a GipfCapture with non-consecutive cases');
            }
            previous = MGPOptional.of(coord);
        }
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
        return this.direction.equals(other.direction);
    }
}

export class GipfMove extends Move {
    public static encoder: MoveEncoder<GipfMove> = new class extends MoveEncoder<GipfMove> {
        public encodeMove(move: GipfMove): JSONValueWithoutArray {
            const encoded: JSONValue = {
                placement: GipfPlacement.encoder.encode(move.placement),
            };

            move.initialCaptures.map((c: GipfCapture, i: number) => {
                encoded['initialCapture' + i] = GipfCapture.encoder.encode(c);
            });
            move.finalCaptures.map((c: GipfCapture, i: number) => {
                encoded['finalCapture' + i] = GipfCapture.encoder.encode(c);
            });

            return encoded;
        }
        public decodeMove(encoded: JSONValueWithoutArray): GipfMove {
            const casted: JSONObject = encoded as JSONObject;
            assert(casted.placement != null, 'Invalid encoded GipfMove');

            return new GipfMove(GipfPlacement.encoder.decode(casted.placement),
                                this.decodeArray(casted, 'initialCapture', GipfCapture.encoder.decode),
                                this.decodeArray(casted, 'finalCapture', GipfCapture.encoder.decode));
        }
        private decodeArray<T>(v: JSONObject, name: string, decode: (v: JSONValue) => T): T[] {
            const array: T[] = [];
            for (let i: number = 0; v[name + i] != null; i++) {
                array.push(decode(v[name + i]));
            }
            return array;
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
        if (ArrayUtils.compareArray(this.initialCaptures, other.initialCaptures) === false) return false;
        if (ArrayUtils.compareArray(this.finalCaptures, other.finalCaptures) === false) return false;
        return true;
    }
    public encode(): JSONValue {
        return GipfMove.encoder.encode(this);
    }
    public decode(encodedMove: JSONValue): GipfMove {
        return GipfMove.encoder.decode(encodedMove);
    }
}
