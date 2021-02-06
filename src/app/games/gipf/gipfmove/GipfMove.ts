import { MGPOptional } from 'src/app/collectionlib/mgpoptional/MGPOptional';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { Encoder } from 'src/app/jscaip/encoder';
import { HexaDirection } from 'src/app/jscaip/hexa/HexaDirection';
import { Move } from 'src/app/jscaip/Move';

export class GipfLine {
    public static fromTwoCoords(coord1: Coord, coord2: Coord): MGPOptional<GipfLine> {
        // Finds the line from the cube coordinates
        const q1: number = coord1.x;
        const q2: number = coord2.x;
        if (q1 === q2) return MGPOptional.of(GipfLine.constantQ(q1));

        const r1: number = coord1.y;
        const r2: number = coord2.y;
        if (r1 === r2) return MGPOptional.of(GipfLine.constantR(r1));

        const s1: number = -q1 - r1;
        const s2: number = -q2 - r2;
        if (s1 === s2) return MGPOptional.of(GipfLine.constantS(s1));

        return MGPOptional.empty();
    }
    public static allLines: ReadonlyArray<GipfLine> = [
        GipfLine.constantQ(-3), GipfLine.constantQ(-2), GipfLine.constantQ(-1), GipfLine.constantQ(-0),
        GipfLine.constantQ(1), GipfLine.constantQ(2), GipfLine.constantQ(3),
        GipfLine.constantR(-3), GipfLine.constantR(-2), GipfLine.constantR(-1), GipfLine.constantR(0),
        GipfLine.constantR(1), GipfLine.constantR(2), GipfLine.constantR(3),
        GipfLine.constantS(-3), GipfLine.constantS(-2), GipfLine.constantS(-1), GipfLine.constantS(0),
        GipfLine.constantS(1), GipfLine.constantS(2), GipfLine.constantS(3),
    ];

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
            console.log({x: coord.x, y: coord.y});
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
                return new Coord(Math.max(-radius, -this.offset - radius), -this.offset);
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
    public constructor(public readonly capturedPieces: ReadonlyArray<Coord>) {
        if (capturedPieces.length < 4) {
            throw new Error('Cannot create a GipfCapture with less than 4 captured pieces');
        }
        if (GipfLine.areOnSameLine(capturedPieces) === false) {
            throw new Error('Cannot create a GipfCapture with pieces that are not on the same line');
        }
    }
    public size(): number {
        return this.capturedPieces.length;
    }
    public forEach(callback: (coord: Coord) => void): void {
        this.capturedPieces.forEach(callback);
    }
    public contains(coord: Coord): boolean {
        for (let i: number = 0; i < this.capturedPieces.length; i++) {
            if (this.capturedPieces[i].equals(coord)) {
                return true;
            }
        }
        return false;
    }
    public getLine(): GipfLine {
        const line: MGPOptional<GipfLine> = GipfLine.fromTwoCoords(this.capturedPieces[0], this.capturedPieces[1]);
        // Invariant: all captured pieces are on the same line, hence we can safely call .get()
        return line.get();
    }
    public equals(other: GipfCapture): boolean {
        if (this === other) return true;
        if (this.capturedPieces.length !== other.capturedPieces.length) return false;
        for (let i: number = 0; i < this.capturedPieces.length; i++) {
            if (!this.capturedPieces[i].equals(other.capturedPieces[i])) return false;
        }
        return true;
    }
}

export class GipfPlacement {
    public constructor(public readonly coord: Coord,
                       public readonly direction: Direction,
                       public readonly isDouble: boolean) {
    }

    public equals(other: GipfPlacement): boolean {
        if (!this.coord.equals(other.coord)) return false;
        if (this.direction !== other.direction) return false;
        if (this.isDouble !== other.isDouble) return false;
        return true;
    }
}

export class GipfMove extends Move {
    public static encoder: Encoder<GipfMove> = new class extends Encoder<GipfMove> {
        public encode(move: GipfMove): number {
            throw new Error('NYI');
        }
        public decode(encoded: number): GipfMove {
            throw new Error('NYI');
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
        if (c1 === c2) return true;
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

