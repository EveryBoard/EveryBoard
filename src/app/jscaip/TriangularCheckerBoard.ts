import { Coord } from './Coord';
import { MGPOptional } from '../utils/MGPOptional';

export class TriangularCheckerBoard {
    public static getNeighbors(c: Coord): Coord[] {
        let neighboors: Coord[];
        const left: Coord = new Coord(c.x - 1, c.y);
        const right: Coord = new Coord(c.x + 1, c.y);
        if ((c.x + c.y)%2 === 1) {
            const up: Coord = new Coord(c.x, c.y - 1);
            neighboors = [left, right, up];
        } else {
            const down: Coord = new Coord(c.x, c.y + 1);
            neighboors = [left, right, down];
        }
        return neighboors;
    }
    public static getFakeNeighbors(c: Coord): Coord {
        if ((c.x + c.y)%2 === 1) return new Coord(c.x, c.y + 1); // DOWN
        return new Coord(c.x, c.y - 1); // UP
    }
    public static getCommonNeighbor(a: Coord, b: Coord): MGPOptional<Coord> {
        const aNeighboors: Coord[] = TriangularCheckerBoard.getNeighbors(a);
        const bNeighboors: Coord[] = TriangularCheckerBoard.getNeighbors(b);
        let i: number = 0;
        while (i < aNeighboors.length) {
            const aNeighboor: Coord = aNeighboors[i];
            let j: number = 0;
            while (j < bNeighboors.length) {
                const bNeighboor: Coord = bNeighboors[j];
                if (aNeighboor.equals(bNeighboor)) {
                    return MGPOptional.of(aNeighboor);
                }
                j++;
            }
            i++;
        }
        return MGPOptional.empty();
    }
}
