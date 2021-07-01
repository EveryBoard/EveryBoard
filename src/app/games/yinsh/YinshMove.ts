import { GipfCapture } from 'src/app/games/gipf/GipfMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Encoder, MoveEncoder } from 'src/app/jscaip/Encoder';
import { Move } from 'src/app/jscaip/Move';
import { arrayEquals } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert, JSONObject, JSONValue, JSONValueWithoutArray } from 'src/app/utils/utils';

// A capture at Yinsh is just like a capture at Gipf, with the only difference
// that it needs to be of length 5 rather than 4
export class YinshCapture extends GipfCapture {
    public constructor(captured: ReadonlyArray<Coord>) {
        if (captured.length !== 5) {
            throw new Error('YinshCapture must capture exactly 5 pieces');
        }
        super(captured);
    }
    public static from(start: Coord, end: Coord): YinshCapture {
        const coords: Coord[] = [];
        for (let cur: Coord = start; cur.equals(end) === false; cur = cur.getNext(end)) {
            coords.push(cur);
        }
        coords.push(end);
        return new YinshCapture(coords);
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
            move.initialCaptures.map((c: GipfCapture, i: number) => {
                encoded['initialCapture' + i] = GipfCapture.encoder.encode(c);
            });
            move.finalCaptures.map((c: GipfCapture, i: number) => {
                encoded['finalCapture' + i] = GipfCapture.encoder.encode(c);
            });

            return encoded;
        }
        public decodeMove(encoded: JSONValueWithoutArray): YinshMove {
            const casted: JSONObject = encoded as JSONObject;
            assert(casted.start != null, 'Invalid encoded YinshMove');

            return new YinshMove(this.decodeArray(casted, 'initialCapture', GipfCapture.encoder.decode),
                                 this.decodeArray(casted, 'finalCapture', GipfCapture.encoder.decode),
                                 Coord.encoder.decode(casted.start),
                                 YinshMove.coordOptionalEncoder.decode(casted.end));
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
                       public readonly finalCaptures: ReadonlyArray<YinshCapture>,
                       public readonly start: Coord,
                       public readonly end: MGPOptional<Coord>) {
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
    }
    public toString(): string {
        return 'YinshMove([' +
            this.capturesToString(this.initialCaptures) + '], ' +
            this.start.toString() + ', ' +
            this.end.toString() + ', [' +
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
}

