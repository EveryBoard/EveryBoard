import { Coord } from './Coord';
import { HexaDirection } from './HexaDirection';

export class HexagonalUtils {

    public static getNeighbors(coord: Coord, distance: number = 1): Coord[] {
        const result: Coord[] = [];
        for (const direction of HexaDirection.ORTHOGONALS) {
            result.push(coord.getNext(direction, distance));
        }
        return result;
    }

    public static areNeighbors(first: Coord, second: Coord): boolean {
        for (const direction of HexaDirection.ORTHOGONALS) {
            if (first.getNext(direction).equals(second)) {
                return true;
            }
        }
        return false;
    }

}
