import { GipfCapture } from 'src/app/games/gipf/GipfMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Encoder } from 'src/app/utils/Encoder';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { JSONObject, JSONValue, JSONValueWithoutArray } from 'src/app/utils/utils';
import { assert } from 'src/app/utils/assert';

// A capture at Yinsh is just like a capture at Gipf, with the only difference
// that it needs to be of length 5 rather than 4, and it contains a ring taken
export class YinshCapture extends GipfCapture {
    public static override encoder: Encoder<YinshCapture> = Encoder.tuple(
        [Encoder.getListEncoder(Coord.encoder), MGPOptional.getEncoder(Coord.encoder)],
        (capture: YinshCapture) => [capture.capturedSpaces, capture.ringTaken],
        (fields: [Array<Coord>, MGPOptional<Coord>]) => new YinshCapture(fields[0], fields[1]),
    );
    public static of(start: Coord, end: Coord, ringTaken?: MGPOptional<Coord>): YinshCapture {
        const coords: Coord[] = [];
        const dir: HexaDirection = HexaDirection.factory.fromMove(start, end).get();
        for (let cur: Coord = start; cur.equals(end) === false; cur = cur.getNext(dir)) {
            coords.push(cur);
        }
        coords.push(end);
        return new YinshCapture(coords, ringTaken);
    }
    public readonly ringTaken: MGPOptional<Coord>;

    public constructor(captured: ReadonlyArray<Coord>,
                       ringTaken: MGPOptional<Coord> = MGPOptional.empty())
    {
        super(captured);
        if (captured.length !== 5) {
            throw new Error('YinshCapture must capture exactly 5 pieces');
        }
        this.ringTaken = ringTaken;
    }
    public setRingTaken(ringTaken: Coord): YinshCapture {
        return new YinshCapture(this.capturedSpaces, MGPOptional.of(ringTaken));
    }
    public override equals(other: YinshCapture): boolean {
        if (super.equals(other) === false) return false;
        if (this.ringTaken.equals(other.ringTaken) === false) return false;
        return true;
    }
}

export type YinshFields = [YinshCapture[], Coord, MGPOptional<Coord>, YinshCapture[]];

export class YinshMove extends Move {

    private static readonly coordOptionalEncoder: Encoder<MGPOptional<Coord>> = MGPOptional.getEncoder(Coord.encoder);

    public static encoder: Encoder<YinshMove> = Encoder.tuple(
        [
            Encoder.getListEncoder(YinshCapture.encoder),
            Coord.encoder,
            MGPOptional.getEncoder(Coord.encoder),
            Encoder.getListEncoder(YinshCapture.encoder),
        ],
        (move: YinshMove) => [move.initialCaptures, move.start, move.end, move.finalCaptures],
        (fields: YinshFields) => new YinshMove(fields[0], fields[1], fields[2], fields[3]),
    );
    public constructor(public readonly initialCaptures: ReadonlyArray<YinshCapture>,
                       public readonly start: Coord,
                       public readonly end: MGPOptional<Coord>,
                       public readonly finalCaptures: ReadonlyArray<YinshCapture>)
    {
        super();
    }
    public isInitialPlacement(): boolean {
        return this.end.isAbsent();
    }
    public equals(other: YinshMove): boolean {
        if (this === other) return true;
        if (this.start.equals(other.start) === false) return false;
        if (this.end.equals(other.end) === false) return false;
        if (ArrayUtils.compareArray(this.initialCaptures, other.initialCaptures) === false) return false;
        if (ArrayUtils.compareArray(this.finalCaptures, other.finalCaptures) === false) return false;
        return true;
    }
    public override toString(): string {
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

