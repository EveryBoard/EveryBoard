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

    public static areNeighbors(first: Coord, second: Coord): boolean {
        for (const direction of HexaDirection.factory.all) {
            if (first.getNext(direction).equals(second)) {
                return true;
            }
        }
        return false;
    }

}
