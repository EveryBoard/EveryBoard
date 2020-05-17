import { Coord } from "./Coord";

export class TriangularCheckerBoard {

    public static getNeighboors(c: Coord): Coord[] {
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
    public static getFakeNeighboors(c: Coord): Coord {
        if ((c.x + c.y)%2 === 1) return new Coord(c.x, c.y + 1); // DOWN
        return new Coord(c.x, c.y - 1); // UP
    }
}