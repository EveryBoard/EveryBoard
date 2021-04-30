import { MoveCoord } from './MoveCoord';
import { Coord } from './coord/Coord';
import { NumberEncoder } from './encoder';
import { MGPOptional } from '../utils/mgp-optional/MGPOptional';
import { Direction, DirectionError } from './Direction';

export abstract class MoveCoordToCoord extends MoveCoord {
    public static getEncoder<T extends MoveCoordToCoord>(width: number, height: number,
                                                         construct: (start: Coord, end: Coord) => T): NumberEncoder<T> {
        return new class extends NumberEncoder<T> {
            private readonly shiftAX: number = height;
            private readonly shiftDY: number = this.shiftAX * width;
            private readonly shiftDX: number = this.shiftDY * height;
            public maxValue(): number {
                return (width-1) * this.shiftDX + (height-1) * this.shiftDY + (width-1) * this.shiftAX + (height-1);
            }
            public encodeNumber(move: T): number {
                const dx: number = move.coord.x;
                const dy: number = move.coord.y;
                const ax: number = move.end.x;
                const ay: number = move.end.y;
                return (dx * this.shiftDX) + (dy * this.shiftDY) + (ax * this.shiftAX) + ay;
            }
            public decodeNumber(encodedMove: number): T {
                // encoded as such : dx; dy; ax; ay
                const ay: number = encodedMove % height;
                encodedMove = encodedMove / height;
                encodedMove -= encodedMove % 1;
                const ax: number = encodedMove % width;
                const end: Coord = new Coord(ax, ay);
                encodedMove = encodedMove / width;
                encodedMove -= encodedMove % 1;
                const dy: number = encodedMove % height;
                encodedMove = encodedMove / height;
                encodedMove -= encodedMove % 1;
                const dx: number = encodedMove % width;
                const start: Coord = new Coord(dx, dy);
                return construct(start, end);
            }
        };
    }

    public readonly end: Coord;

    constructor(start: Coord, end: Coord) {
        super(start.x, start.y);
        if (end == null) throw new Error('End cannot be null.');
        if (start.equals(end)) throw new Error('MoveCoordToCoord cannot be static.');
        this.end = end;
    }
    public length(): number {
        return this.coord.getDistance(this.end);
    }
    public getDirection(): MGPOptional<Direction> {
        try {
            return MGPOptional.of(Direction.factory.fromMove(this.coord, this.end));
        } catch (e) {
            if (e instanceof DirectionError) {
                return MGPOptional.empty();
            } else {
                throw e;
            }
        }
    }
}
