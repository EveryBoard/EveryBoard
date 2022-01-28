import { Coord } from './Coord';
import { HexaOrientation } from './HexaOrientation';

export class HexaLayout {
    public constructor(public readonly size: number,
                       public readonly origin: Coord,
                       public readonly orientation: HexaOrientation) {
    }
    public getCenterAt(coord: Coord): Coord {
        const M: [number, number, number, number] = this.orientation.conversionMatrix;
        const x: number = this.size * (M[0] * coord.x + M[1] * coord.y);
        const y: number = this.size * (M[2] * coord.x + M[3] * coord.y);
        return new Coord(x + this.origin.x, y + this.origin.y);
    }
    private getCornerOffset(corner: number): Coord {
        const angle: number = 2 * Math.PI * (this.orientation.startAngle + corner) / 6;
        return new Coord(this.size * Math.cos(angle), this.size * Math.sin(angle));
    }
    public getHexaCoordsAt(coord: Coord): ReadonlyArray<Coord> {
        const center: Coord = this.getCenterAt(coord);
        const corners: Coord[] = [];
        for (let i: number = 0; i < 6; i += 1) {
            const offset: Coord = this.getCornerOffset(i);
            corners.push(new Coord(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }
}
