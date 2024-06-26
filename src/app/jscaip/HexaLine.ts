import { MGPOptional } from '@everyboard/lib';
import { Coord } from './Coord';
import { HexaDirection } from './HexaDirection';

export class HexaLine {
    public static fromTwoCoords(coord1: Coord, coord2: Coord): MGPOptional<HexaLine> {
        // Finds the line from the cube coordinates
        const x1: number = coord1.x;
        const x2: number = coord2.x;

        const y1: number = coord1.y;
        const y2: number = coord2.y;

        const s1: number = x1 + y1;
        const s2: number = x2 + y2;

        if (x1 === x2 && y1 !== y2 && s1 !== s2) return MGPOptional.of(HexaLine.constantQ(x1));
        if (x1 !== x2 && y1 === y2 && s1 !== s2) return MGPOptional.of(HexaLine.constantR(y1));
        if (x1 !== x2 && y1 !== y2 && s1 === s2) return MGPOptional.of(HexaLine.constantS(s1));

        return MGPOptional.empty();
    }
    public static constantQ(offset: number): HexaLine {
        return new HexaLine(offset, 'q');
    }
    public static constantR(offset: number): HexaLine {
        return new HexaLine(offset, 'r');
    }
    public static constantS(offset: number): HexaLine {
        return new HexaLine(offset, 's');
    }
    public static areOnSameLine(coords: ReadonlyArray<Coord>): boolean {
        if (coords.length < 2) return true;
        const lineOpt: MGPOptional<HexaLine> = HexaLine.fromTwoCoords(coords[0], coords[1]);
        if (lineOpt.isAbsent()) return false;
        const line: HexaLine = lineOpt.get();

        for (const coord of coords.slice(2)) {
            if (line.contains(coord) === false) return false;
        }
        return true;
    }
    private constructor(public readonly offset: number,
                        public readonly constant: 'q' | 'r' | 's')
    {
    }
    public toString(): string {
        return `Line(${this.constant}, ${this.offset})`;
    }
    public equals(other: HexaLine): boolean {
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
                return coord.x + coord.y === this.offset;
        }
    }
    public getDirection(): HexaDirection {
        switch (this.constant) {
            case 'q':
                return HexaDirection.DOWN;
            case 'r':
                return HexaDirection.RIGHT;
            case 's':
                return HexaDirection.DOWN_LEFT;
        }
    }
}
