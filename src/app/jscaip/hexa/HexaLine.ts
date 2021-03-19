import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { Coord } from '../coord/Coord';
import { Direction } from '../Direction';
import { HexaDirection } from './HexaDirection';

export class HexaLine {
    public static fromTwoCoords(coord1: Coord, coord2: Coord): MGPOptional<HexaLine> {
        // Finds the line from the cube coordinates
        const q1: number = coord1.x;
        const q2: number = coord2.x;

        const r1: number = coord1.y;
        const r2: number = coord2.y;

        const s1: number = -q1 - r1;
        const s2: number = -q2 - r2;

        if (q1 === q2 && r1 !== r2 && s1 !== s2) return MGPOptional.of(HexaLine.constantQ(q1));
        if (q1 !== q2 && r1 === r2 && s1 !== s2) return MGPOptional.of(HexaLine.constantR(r1));
        if (q1 !== q2 && r1 !== r2 && s1 === s2) return MGPOptional.of(HexaLine.constantS(s1));

        return MGPOptional.empty();
    }
    public static allLines(radius: number): ReadonlyArray<HexaLine> {
        const lines: HexaLine[] = [];
        for (let i: number = -radius; i <= radius; i++) {
            lines.push(HexaLine.constantQ(i));
            lines.push(HexaLine.constantR(i));
            lines.push(HexaLine.constantS(i));
        }
        return lines;
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

    private constructor(private readonly offset: number,
                       private readonly constant: 'q' | 'r' | 's') {
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
