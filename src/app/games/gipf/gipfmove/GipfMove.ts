import { Table } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { Encoder } from 'src/app/jscaip/encoder';
import { Move } from 'src/app/jscaip/Move';

export class GipfLine {
    public constructor(public readonly entrance: Coord,
                       public readonly direction: Direction) {
    }

    public equals(other: GipfLine): boolean {
        if (this === other) return true;
        if (this.entrance.equals(other.entrance)) return false;
        if (this.direction !== other.direction) return false;
        return true;
    }
}

export class GipfCapture {
    public constructor(public readonly line: GipfLine,
                       public readonly capturedPieces: ReadonlyArray<Coord>) {
    }
    public size(): number {
        return this.capturedPieces.length;
    }
    public forEach(callback: (coord: Coord) => void): void {
        this.capturedPieces.forEach(callback);
    }
    public contains(coord: Coord): boolean {
        for (let i = 0; i < this.capturedPieces.length; i++) {
            if (this.capturedPieces[i].equals(coord)) {
                return true;
            }
        }
        return false;
    }
    public equals(other: GipfCapture): boolean {
        if (this === other) return true;
        if (this.line.equals(other.line) === false) return false;
        if (this.capturedPieces.length !== other.capturedPieces.length) return false;
        for (let i = 0; i < this.capturedPieces.length; i++) {
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

    public equals(o: any): boolean {
        if (this === o) return true;
        if (!(o instanceof GipfMove)) return false;
        const other: GipfMove = <GipfMove> o;
        if (this.placement.equals(other.placement) === false) return false;
        if (this.captureEquals(this.initialCaptures, other.initialCaptures) === false) return false;
        if (this.captureEquals(this.finalCaptures, other.finalCaptures) === false) return false;
        return true;
    }

    private captureEquals(c1: ReadonlyArray<GipfCapture>, c2: ReadonlyArray<GipfCapture>): boolean {
        if (c1 === c2) return true;
        if (c1.length !== c2.length) return false;
        for (let i = 0; i < c1.length; i++) {
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

