import { Coord } from '../../jscaip/Coord';

export class MartianChessComponentUtils {
    public static readonly SPACE_SIZE: number = 100;
    public static readonly STROKE_WIDTH: number = 8;

    public static getRegularPolygon(nbSide: number, yOffset: number = 0): string {
        const coords: Coord[] = MartianChessComponentUtils.getRegularPolygonCoords(nbSide, yOffset);
        return MartianChessComponentUtils.mapCoordsToString(coords);
    }

    public static getNPointedStar(nbSide: number, degreeOffset: number): string {
        const coords: Coord[] = MartianChessComponentUtils.getNPointedStarCoords(nbSide, degreeOffset);
        return MartianChessComponentUtils.mapCoordsToString(coords);
    }

    public static getNPointedStarCoords(nbSide: number, degreeOffset: number): Coord[] {
        const points: Coord[] = [];
        const cx: number = 0.5 * MartianChessComponentUtils.SPACE_SIZE;
        const cy: number = 0.5 * MartianChessComponentUtils.SPACE_SIZE;
        nbSide *= 2;
        for (let indexDot: number = 0; indexDot < nbSide; indexDot++) {
            const degree: number = (indexDot * (360 / nbSide)) + degreeOffset;
            const radian: number = (degree / 180) * Math.PI;
            const radius: number = (indexDot % 2 === 0) ?
                MartianChessComponentUtils.SPACE_SIZE/2 : MartianChessComponentUtils.SPACE_SIZE/6;
            const px: number = cx + (0.8 * radius * Math.cos(radian));
            const py: number = cy + (0.8 * radius * Math.sin(radian));
            points.push(new Coord(px, py));
        }
        return points;
    }

    /**
     * coord are based on a 100 x 100 containing square, in which the shape is centered
     * yOffset describe the offset "pixel wise" (concrete offset in "svg unit")
     */
    public static getRegularPolygonCoords(nbSide: number, yOffset: number = 0): Coord[] {
        const points: Coord[] = [];
        const cx: number = 0.5 * MartianChessComponentUtils.SPACE_SIZE;
        const cy: number = 0.5 * MartianChessComponentUtils.SPACE_SIZE;
        for (let indexCorner: number = 0; indexCorner < nbSide; indexCorner++) {
            const degree: number = (indexCorner * (360 / nbSide)) - 90;
            const radian: number = (degree / 180) * Math.PI;
            const radius: number = 0.5 * MartianChessComponentUtils.SPACE_SIZE;
            const px: number = cx + (0.8 * radius * Math.cos(radian));
            const py: number = cy + (0.8 * radius * Math.sin(radian)) + yOffset;
            points.push(new Coord(px, py));
        }
        return points;
    }

    public static mapCoordsToString(coords: Coord[]): string {
        let points: string = '';
        for (const coord of coords) {
            points += coord.x + ', ' + coord.y + ' ';
        }
        return points;
    }

    public static getRadius(circle: number): number {
        return MartianChessComponentUtils.SPACE_SIZE * circle / 10;
    }

}
