import { Utils } from '@everyboard/lib';
import { Coord } from './Coord';
import { FlatHexaOrientation, HexaOrientation } from './HexaOrientation';

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

    // Points of this function have (0, 0) as the center of the hexagon
    public getHexaPointsList(): Coord[] {
        const corners: Coord[] = [];
        for (let i: number = 0; i < 6; i += 1) {
            const offset: Coord = this.getCornerOffset(i);
            corners.push(new Coord(offset.x, offset.y));
        }
        return corners;
    }

    public getHexaPoints(): string {
        const points: string[] = this.getHexaPointsList().map((c: Coord) => c.toSVGPoint());
        return points.join(' ');
    }

    /**
     * Returns the points to draw polygons to render a hexagon in an isometric view.
     * The first polygon is the one on the bottom left.
     * The second polygon is the one on the bottom and bottom right.
     * The third polygon is the polygon formed by the union of the first two
     * Each polygon is shown below for a flat orientation.
     *    ___
     *   /   \
     *  /     \
     * |       |
     * |       |
     * |\     /|
     * |1\___/ |
     * \ |  2 /
     *  \|___/
     *
     * So far, only used in a pointy orientation, may need to be adapted for a flat orientation.
     */
    public getIsoPoints(coord: Coord, height: number): [Coord[], Coord[], Coord[]] {
        Utils.assert(this.orientation === FlatHexaOrientation.INSTANCE, 'HexaLayout.getIsoPoints can only be used with flat orientation');
        const center: Coord = this.getCenterAt(coord);
        const right: Coord = this.getCornerOffset(0);
        const bottomRight: Coord = this.getCornerOffset(1);
        const bottomLeft: Coord = this.getCornerOffset(2);
        const left: Coord = this.getCornerOffset(3);
        const bottomLeftPolygon: Coord[] = [
            new Coord(center.x + left.x, center.y + left.y),
            new Coord(center.x + left.x, center.y + left.y + height),
            new Coord(center.x + bottomLeft.x, center.y + bottomLeft.y + height),
            new Coord(center.x + bottomLeft.x, center.y + bottomLeft.y),
        ];
        const bottomRightPolygon: Coord[] = [
            new Coord(center.x + right.x, center.y + right.y),
            new Coord(center.x + right.x, center.y + right.y + height),
            new Coord(center.x + bottomRight.x, center.y + bottomRight.y + height),
            new Coord(center.x + bottomLeft.x, center.y + bottomLeft.y + height),
            new Coord(center.x + bottomLeft.x, center.y + bottomLeft.y),
            new Coord(center.x + bottomRight.x, center.y + bottomRight.y),
        ];
        const fullPolygon: Coord[] = [
            new Coord(center.x + left.x, center.y + left.y),
            new Coord(center.x + left.x, center.y + left.y + height),
            new Coord(center.x + bottomLeft.x, center.y + bottomLeft.y + height),
            new Coord(center.x + bottomRight.x, center.y + bottomRight.y + height),
            new Coord(center.x + right.x, center.y + right.y + height),
            new Coord(center.x + right.x, center.y + right.y),
            new Coord(center.x + bottomRight.x, center.y + bottomRight.y),
            new Coord(center.x + bottomLeft.x, center.y + bottomLeft.y),
        ];
        return [bottomLeftPolygon, bottomRightPolygon, fullPolygon];
    }

}
