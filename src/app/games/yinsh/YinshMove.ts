import { GipfCapture } from 'src/app/games/gipf/GipfMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Encoder, MoveEncoder } from 'src/app/jscaip/Encoder';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Move } from 'src/app/jscaip/Move';
import { arrayEquals } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert, JSONObject, JSONValue, JSONValueWithoutArray } from 'src/app/utils/utils';

// A capture at Yinsh is just like a capture at Gipf, with the only difference
// that it needs to be of length 5 rather than 4, and it contains a ring taken
export class YinshCapture extends GipfCapture {
    public static encoder: Encoder<YinshCapture> = new class extends Encoder<YinshCapture> {
        public encode(capture: YinshCapture): JSONValue {
            return {
                captured: capture.capturedCases.map((coord: Coord): JSONValueWithoutArray => {
                    return Coord.encoder.encode(coord) as JSONValueWithoutArray;
                }),
                ringTaken: Coord.encoder.encode(capture.ringTaken),
            };
        }
        public decode(encoded: JSONValue): YinshCapture {
            const casted: JSONObject = encoded as JSONObject;
            assert(casted.captured != null && casted.ringTaken != null, 'Invalid encoded YinshCapture');
            return new YinshCapture(
                (casted.captured as Array<JSONValueWithoutArray>).map((c: JSONValueWithoutArray): Coord => {
                    return Coord.encoder.decode(c);
                }),
                Coord.encoder.decode(casted.ringTaken));
        }
    };
    public static of(start: Coord, end: Coord, ringTaken: Coord): YinshCapture {
        const coords: Coord[] = [];
        const dir: HexaDirection = HexaDirection.factory.fromMove(start, end);
        for (let cur: Coord = start; cur.equals(end) === false; cur = cur.getNext(dir)) {
            coords.push(cur);
        }
        coords.push(end);
        return new YinshCapture(coords, ringTaken);
    }
    public constructor(captured: ReadonlyArray<Coord>,
                       public readonly ringTaken: Coord) {
        super(captured);
        if (captured.length !== 5) {
            throw new Error('YinshCapture must capture exactly 5 pieces');
        }
    }
    public setRingTaken(coord: Coord): YinshCapture {
        return new YinshCapture(this.capturedCases, coord);
    }
    public equals(other: YinshCapture): boolean {
        if (super.equals(other) === false) return false;
        if (this.ringTaken.equals(other.ringTaken) === false) return false;
        return true;
    }
}

export class YinshMove extends Move {
    private static coordOptionalEncoder: Encoder<MGPOptional<Coord>> = MGPOptional.encoder(Coord.encoder);
    public static encoder: MoveEncoder<YinshMove> = new class extends MoveEncoder<YinshMove> {
        public encodeMove(move: YinshMove): JSONValueWithoutArray {
            const encoded: JSONValue = {
                moveStart: Coord.encoder.encode(move.start),
                moveEnd: YinshMove.coordOptionalEncoder.encode(move.end),
            };
            move.initialCaptures.map((c: YinshCapture, i: number) => {
                encoded['initialCapture' + i] = YinshCapture.encoder.encode(c);
            });
            move.finalCaptures.map((c: YinshCapture, i: number) => {
                encoded['finalCapture' + i] = YinshCapture.encoder.encode(c);
            });

            return encoded;
        }
        public decodeMove(encoded: JSONValueWithoutArray): YinshMove {
            const casted: JSONObject = encoded as JSONObject;
            assert(casted.moveStart != null, 'Invalid encoded YinshMove');

            return new YinshMove(this.decodeArray(casted, 'initialCapture', YinshCapture.encoder.decode),
                                 Coord.encoder.decode(casted.moveStart),
                                 YinshMove.coordOptionalEncoder.decode(casted.moveEnd),
                                 this.decodeArray(casted, 'finalCapture', YinshCapture.encoder.decode));
        }
        private decodeArray<T>(v: JSONObject, name: string, decode: (v: JSONValue) => T): T[] {
            const array: T[] = [];
            for (let i: number = 0; v[name + i] != null; i++) {
                array.push(decode(v[name + i]));
            }
            return array;
        }
    }
    public constructor(public readonly initialCaptures: ReadonlyArray<YinshCapture>,
                       public readonly start: Coord,
                       public readonly end: MGPOptional<Coord>,
                       public readonly finalCaptures: ReadonlyArray<YinshCapture>) {
        super();
    }
    public isInitialPlacement(): boolean {
        return this.end.isAbsent();
    }
    public equals(other: YinshMove): boolean {
        if (this === other) return true;
        if (this.start.equals(other.start) === false) return false;
        if (this.end.equals(other.end) === false) return false;
        if (arrayEquals(this.initialCaptures, other.initialCaptures) === false) return false;
        if (arrayEquals(this.finalCaptures, other.finalCaptures) === false) return false;
        return true;
    }
    public toString(): string {
        return 'YinshMove([' +
            this.capturesToString(this.initialCaptures) + '], ' +
            this.start.toString() + ', ' +
            this.end.toString() + ', [' +
            this.capturesToString(this.finalCaptures) + '])';
    }
    private capturesToString(captures: ReadonlyArray<YinshCapture>): string {
        let str: string = '';
        for (const capture of captures) {
            if (str !== '') {
                str += ',';
            }
            str += '[' + capture.toString() + ']';
        }
        return str;
    }
}

