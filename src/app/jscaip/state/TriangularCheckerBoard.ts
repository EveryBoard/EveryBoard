import { Coord } from '../Coord';
import { MGPOptional } from '@everyboard/lib';
import { Orthogonal } from '../Orthogonal';


export class TriangularCheckerBoard {

    public static getDirections(c: Coord): Orthogonal[] {
        const left: Orthogonal = Orthogonal.LEFT;
        const right: Orthogonal = Orthogonal.RIGHT;
        if ((c.x + c.y) % 2 === 1) {
            const up: Orthogonal = Orthogonal.UP;
            return [left, right, up];
        } else {
            const down: Orthogonal = Orthogonal.DOWN;
            return [left, right, down];
        }
    }

    public static getNeighbors(c: Coord): Coord[] {
        return TriangularCheckerBoard.getDirections(c)
            .map((direction: Orthogonal) => c.getNext(direction));
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
