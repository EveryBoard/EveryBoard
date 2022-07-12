import { Move } from './Move';
import { Coord } from './Coord';
import { NumberEncoder } from './Encoder';

export abstract class MoveCoord extends Move {

    public readonly coord: Coord;

    constructor(x: number, y: number) {
        super();
        this.coord = new Coord(x, y);
    }
}

export class MoveCoordEncoder {

    public static getEncoder<T extends MoveCoord>(width: number, height: number,
                                                  generateMove: (coord: Coord) => T): NumberEncoder<T> {
        return new class extends NumberEncoder<T> {
            private readonly shiftX: number = height;
            public maxValue(): number {
                return (width-1) * this.shiftX + (height-1);
            }
            public encodeNumber(move: T): number {
                return (move.coord.x * this.shiftX) + move.coord.y;
            }
            public decodeNumber(encodedMove: number): T {
                const y: number = encodedMove % height;
                encodedMove = encodedMove / height;
                encodedMove -= encodedMove % 1;
                const x: number = encodedMove % width;
                const coord: Coord = new Coord(x, y);
                return generateMove(coord);
            }
        };
    }

}
