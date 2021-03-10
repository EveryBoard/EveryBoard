import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { Encoder } from 'src/app/jscaip/encoder';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { Move } from 'src/app/jscaip/Move';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';

export class GipfBoard {
    public static RADIUS: number = 3;
    public static coordEncoder: Encoder<Coord> = new class extends Encoder<Coord> {
        public maxValue(): number {
            return (GipfBoard.RADIUS*2) * (GipfBoard.RADIUS*2+1) + (GipfBoard.RADIUS*2);
        }
        public encode(coord: Coord): number {
            // assertion: (Math.abs(coord.x) > GipfBoard.RADIUS || Math.abs(coord.y) > GipfBoard.RADIUS) {
            return (coord.x+GipfBoard.RADIUS) * (GipfBoard.RADIUS*2+1) + (coord.y+GipfBoard.RADIUS);
        }
        public decode(encoded: number): Coord {
            const y: number = encoded % (GipfBoard.RADIUS*2+1);
            const x: number = (encoded - y) / (GipfBoard.RADIUS*2+1);
            return new Coord(x-GipfBoard.RADIUS, y-GipfBoard.RADIUS);
        }
    }
}

export class GipfLine {
    public static fromTwoCoords(coord1: Coord, coord2: Coord): MGPOptional<GipfLine> {
        // Finds the line from the cube coordinates
        const q1: number = coord1.x;
        const q2: number = coord2.x;

        const r1: number = coord1.y;
        const r2: number = coord2.y;

        const s1: number = -q1 - r1;
        const s2: number = -q2 - r2;

        if (q1 === q2 && r1 !== r2 && s1 !== s2) return MGPOptional.of(GipfLine.constantQ(q1));
        if (q1 !== q2 && r1 === r2 && s1 !== s2) return MGPOptional.of(GipfLine.constantR(r1));
        if (q1 !== q2 && r1 !== r2 && s1 === s2) return MGPOptional.of(GipfLine.constantS(s1));

        return MGPOptional.empty();
    }
    public static allLines(): ReadonlyArray<GipfLine> {
        const lines: GipfLine[] = [];
        for (let i: number = -GipfBoard.RADIUS; i <= GipfBoard.RADIUS; i++) {
            lines.push(GipfLine.constantQ(i));
            lines.push(GipfLine.constantR(i));
            lines.push(GipfLine.constantS(i));
        }
        return lines;
    }

    public static constantQ(offset: number): GipfLine {
        return new GipfLine(offset, 'q');
    }

    public static constantR(offset: number): GipfLine {
        return new GipfLine(offset, 'r');
    }

    public static constantS(offset: number): GipfLine {
        return new GipfLine(offset, 's');
    }

    public static areOnSameLine(coords: ReadonlyArray<Coord>): boolean {
        if (coords.length < 2) return true;
        const lineOpt: MGPOptional<GipfLine> = GipfLine.fromTwoCoords(coords[0], coords[1]);
        if (lineOpt.isAbsent()) return false;
        const line: GipfLine = lineOpt.get();

        for (const coord of coords.slice(2)) {
            if (line.contains(coord) === false) return false;
        }
        return true;
    }

    private constructor(private readonly offset: number,
                       private readonly constant: 'q' | 'r' | 's') {
    }

    public equals(other: GipfLine): boolean {
        if (this === other) return true;
        if (this.offset !== other.offset) return false;
        if (this.constant !== other.constant) return false;
        return true;
    }

    public contains(coord: Coord): boolean {
        switch (this.constant) {
            case 'q':
                return coord.x === this.offset;
            case 'r':
                return coord.y === this.offset;
            case 's':
                return -coord.x - coord.y === this.offset;
        }
    }
    public getEntrance(): Coord {
        const radius: number = 3;
        switch (this.constant) {
            case 'q':
                return new Coord(this.offset, Math.max(-radius, -this.offset - radius));
            case 'r':
                return new Coord(Math.max(-radius, -this.offset - radius), this.offset);
            case 's':
                return new Coord(Math.min(radius, -this.offset + radius), Math.max(-radius, -this.offset - radius));
        }
    }
    public getDirection(): Direction {
        switch (this.constant) {
            case 'q':
                return HexaDirection.DOWN;
            case 'r':
                return HexaDirection.DOWN_RIGHT;
            case 's':
                return HexaDirection.DOWN_LEFT;
        }
    }
}

export class GipfCapture {
    private static coordsEncoder: Encoder<ReadonlyArray<Coord>> =
        Encoder.arrayEncoder(GipfBoard.coordEncoder, 6);
    public static encoder: Encoder<GipfCapture> = new class extends Encoder<GipfCapture> {
        public maxValue(): number {
            return GipfCapture.coordsEncoder.maxValue();
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
        if (GipfLine.areOnSameLine(captured) === false) {
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
    public getLine(): GipfLine {
        const line: MGPOptional<GipfLine> = GipfLine.fromTwoCoords(this.capturedCases[0], this.capturedCases[1]);
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
        Encoder.arrayEncoder(GipfCapture.encoder, 7); // There can be 7 captures at most in one capture round
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
        return 'GipfMove'; // TODO
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

