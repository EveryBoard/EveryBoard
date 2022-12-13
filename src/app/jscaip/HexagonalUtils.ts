import { Coord } from './Coord';
import { HexaDirection } from './HexaDirection';

export class HexagonalUtils {

    public static neighbors(coord: Coord, distance: number = 1): Coord[] {
        const result: Coord[] = [];
        for (const direction of HexaDirection.factory.all) {
            result.push(coord.getNext(direction, distance));
        }
        return result;
    }

    public static areNeighbors(coord1: Coord, coord2: Coord): boolean {
        for (const direction of HexaDirection.factory.all) {
            if (coord1.getNext(direction).equals(coord2)) {
                return true;
            }
        }
        return false;
    }

}
