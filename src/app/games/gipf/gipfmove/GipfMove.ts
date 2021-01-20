import { Table } from 'src/app/collectionlib/arrayutils/ArrayUtils';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/DIRECTION';
import { Encoder } from 'src/app/jscaip/encoder';
import { Move } from 'src/app/jscaip/Move';

export class GipfLine {
    public constructor(public readonly entrance: Coord,
                       public readonly direction: Direction) {
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
        return this.capturedPieces.includes(coord);
    }
}

export class GipfPlacement {
    public constructor(public readonly coord: Coord,
                       public readonly direction: Direction,
                       public readonly isDouble: boolean) {
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
        // TODO
        if (this.x !== other.x) return false;
        if (this.y !== other.y) return false;
        if (this.direction !== other.direction) return false;
        if (this.isDouble !== other.isDouble) return false;
        if (this.initialCaptures.length !== other.initialCaptures.length) return false;
        if (this.tableEquals(this.initialCaptures, other.initialCaptures) === false) return false;
        if (this.tableEquals(this.finalCaptures, other.finalCaptures) === false) return false;
        if (this.finalCaptures !== other.finalCaptures) return false;
        return true;
    }

    private tableEquals(t1: Table<Coord>, t2: Table<Coord>): boolean {
        for (let i = 0; i < t1.length; i++) {
            if (t1[i].length !== t2[i].length) return false
            for (let j = 0; j < t1[i].length; j++) {
                if (!t1[i][j].equals(t2[i][j])) return false;
            }
        }
    }

    public encode(): number {
        return GipfMove.encoder.encode(this);
    }
    public decode(encodedMove: number): GipfMove {
        return GipfMove.encoder.decode(encodedMove);
    }
}

