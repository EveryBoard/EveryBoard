import { Coord } from './Coord';
import { MGPOptional } from '@everyboard/lib';

export class TriangularCheckerBoard {

    public static getNeighbors(c: Coord): Coord[] {
        let neighbors: Coord[];
        const left: Coord = new Coord(c.x - 1, c.y);
        const right: Coord = new Coord(c.x + 1, c.y);
        if ((c.x + c.y)%2 === 1) {
            const up: Coord = new Coord(c.x, c.y - 1);
            neighbors = [left, right, up];
        } else {
            const down: Coord = new Coord(c.x, c.y + 1);
            neighbors = [left, right, down];
        }
        return neighbors;
    }
    public static getFakeNeighbors(c: Coord): Coord {
        if ((c.x + c.y)%2 === 1) return new Coord(c.x, c.y + 1); // DOWN
        return new Coord(c.x, c.y - 1); // UP
    }
    public static getCommonNeighbor(a: Coord, b: Coord): MGPOptional<Coord> {
        const aNeighbors: Coord[] = TriangularCheckerBoard.getNeighbors(a);
        const bNeighbors: Coord[] = TriangularCheckerBoard.getNeighbors(b);
        let i: number = 0;
        while (i < aNeighbors.length) {
            const aNeighbor: Coord = aNeighbors[i];
            let j: number = 0;
            while (j < bNeighbors.length) {
                const bNeighbor: Coord = bNeighbors[j];
                if (aNeighbor.equals(bNeighbor)) {
                    return MGPOptional.of(aNeighbor);
                }
                j++;
            }
            i++;
        }
        return MGPOptional.empty();
    }
    public static isSpaceDark(coord: Coord): boolean {
        return (coord.x + coord.y) % 2 === 0;
    }
}
