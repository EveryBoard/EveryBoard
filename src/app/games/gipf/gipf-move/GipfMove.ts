import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Encoder } from 'src/app/jscaip/encoder';
import { HexaLine } from 'src/app/jscaip/hexa/HexaLine';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { GipfBoard } from './GipfBoard';

export class GipfCapture {
    private static coordsEncoder: Encoder<ReadonlyArray<Coord>> =
        Encoder.arrayEncoder(GipfBoard.coordEncoder, 6);
    private static sizeEncoder: Encoder<number> =
        Encoder.numberEncoder(6);
    // Encodes a capture as: initial case, direction, length
    public static encoder: Encoder<GipfCapture> = new class extends Encoder<GipfCapture> {
        public maxValue(): number {
            return (GipfBoard.coordEncoder.maxValue() *
                Direction.encoder.shift() + Direction.encoder.maxValue()) *
                GipfCapture.sizeEncoder.shift() + GipfCapture.sizeEncoder.maxValue();
        }
        public encode(capture: GipfCapture): number {
            return GipfCapture.coordsEncoder.encode(capture.capturedCases);
        }
        public decode(encoded: number): GipfCapture {
            return new GipfCapture(GipfCapture.coordsEncoder.decode(encoded));
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
        public maxValue(): number {
            return (GipfBoard.coordEncoder.maxValue() *
                Direction.encoder.shift() + Direction.encoder.maxValue()) *
                Encoder.booleanEncoder.shift() + Encoder.booleanEncoder.maxValue();
        }
        public encode(placement: GipfPlacement): number {
            if (placement.direction.isPresent()) {
                return (GipfBoard.coordEncoder.encode(placement.coord) *
                    Direction.encoder.shift() + Direction.encoder.encode(placement.direction.get())) *
                    Encoder.booleanEncoder.shift() + Encoder.booleanEncoder.encode(true);
            } else {
                return (GipfBoard.coordEncoder.encode(placement.coord) *
                    Direction.encoder.shift()) *
                    Encoder.booleanEncoder.shift() + Encoder.booleanEncoder.encode(false);
            }
        }
        public decode(encoded: number): GipfPlacement {
            const hasDirectionN: number = encoded % Encoder.booleanEncoder.shift();
            encoded = (encoded - hasDirectionN) / Encoder.booleanEncoder.shift();
            const directionN: number = encoded % Direction.encoder.shift();
            const coordN: number = (encoded - directionN) / Direction.encoder.shift();
            if (Encoder.booleanEncoder.decode(hasDirectionN)) {
                return new GipfPlacement(GipfBoard.coordEncoder.decode(coordN),
                                         MGPOptional.of(Direction.encoder.decode(directionN)));
            } else {
                return new GipfPlacement(GipfBoard.coordEncoder.decode(coordN), MGPOptional.empty());
            }
        }
    }
    public constructor(public readonly coord: Coord,
                       public readonly direction: MGPOptional<Direction>) {
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
        const cmpDir: (x: Direction, y: Direction) => boolean = (x: Direction, y: Direction): boolean => {
            return x === y;
        };
        if (this.direction.equals(other.direction, cmpDir) === false) return false;
        return true;
    }
}

export class GipfMove extends Move {
    private static capturesEncoder: Encoder<ReadonlyArray<GipfCapture>> =
         // There can be 7 captures at most in one capture round, but we only support 6
        Encoder.arrayEncoder(GipfCapture.encoder, 2);
    public static encoder: Encoder<GipfMove> = new class extends Encoder<GipfMove> {
        public maxValue(): number {
            return (GipfPlacement.encoder.maxValue() *
                GipfMove.capturesEncoder.shift() + GipfMove.capturesEncoder.maxValue()) *
                GipfMove.capturesEncoder.shift() + GipfMove.capturesEncoder.maxValue();
        }
        public encode(move: GipfMove): number {
            return (GipfPlacement.encoder.encode(move.placement) *
                GipfMove.capturesEncoder.shift() + GipfMove.capturesEncoder.encode(move.initialCaptures)) *
                GipfMove.capturesEncoder.shift() + GipfMove.capturesEncoder.encode(move.finalCaptures);
        }
        public decode(encoded: number): GipfMove {
            const finalCapturesN: number = encoded % GipfMove.capturesEncoder.shift();
            encoded = (encoded - finalCapturesN) / GipfMove.capturesEncoder.shift();
            const initialCapturesN: number = encoded % GipfMove.capturesEncoder.shift();
            encoded = (encoded - initialCapturesN) / GipfMove.capturesEncoder.shift();
            const placementN: number = encoded;
            return new GipfMove(GipfPlacement.encoder.decode(placementN),
                                GipfMove.capturesEncoder.decode(initialCapturesN),
                                GipfMove.capturesEncoder.decode(finalCapturesN));
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
    public encode(): number {
        return GipfMove.encoder.encode(this);
    }
    public decode(encodedMove: number): GipfMove {
        return GipfMove.encoder.decode(encodedMove);
    }
}

