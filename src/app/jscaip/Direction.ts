import { assert, JSONValue } from 'src/app/utils/utils';
import { Coord } from './Coord';
import { Encoder } from './encoder';

export class DirectionError extends Error {
    constructor(message?: string) {
        const trueProto = new.target.prototype;
        super(message);
        Object.setPrototypeOf(this, trueProto);
    }
}

export class Vector {
    // Since it's not a coord and not a direction, what should we do to name thing correctly and avoid code overlap ?

    public static equals(a: Vector, b: Vector): boolean {
        return a.x === b.x && a.y === b.y;
    }
    public constructor(public readonly x: number,
                       public readonly y: number) {}
}

abstract class AbstractDirection extends Vector {
    public readonly x: -1|0|1;
    public readonly y: -1|0|1;
}

export abstract class DirectionFactory<T extends AbstractDirection> {
    public abstract all: ReadonlyArray<T>;
    public of(x: number, y: number): T {
        for (const dir of this.all) {
            if (dir.x === x && dir.y === y) return dir;
        }
        throw new DirectionError('Invalid direction');
    }

    public fromDelta(dx: number, dy: number): T {
        if (dx === 0 && dy === 0) {
            throw new DirectionError('Invalid direction from static move');
        } else if (Math.abs(dx) === Math.abs(dy) ||
                   dx === 0 ||
                   dy === 0)
        {
            return this.of(Math.sign(dx), Math.sign(dy));
        }
        throw new DirectionError('Invalid direction from delta dx:' + dx + ', dy:' + dy);
    }
    public fromMove(start: Coord, end: Coord): T {
        return this.fromDelta(end.x - start.x, end.y - start.y);
    }
    public fromString(str: string): T {
        switch (str) {
            case 'UP': return this.of(0, -1);
            case 'RIGHT': return this.of(1, 0);
            case 'DOWN': return this.of(0, 1);
            case 'LEFT': return this.of(-1, 0);
            case 'UP_LEFT': return this.of(-1, -1);
            case 'UP_RIGHT': return this.of(1, -1);
            case 'DOWN_LEFT': return this.of(-1, 1);
            case 'DOWN_RIGHT': return this.of(1, 1);
            default: throw new DirectionError('Unknown direction ' + str);
        }
    }
    public fromInt(int: number): T {
        switch (int) {
            case 0: return this.of(0, -1);
            case 1: return this.of(1, 0);
            case 2: return this.of(0, 1);
            case 3: return this.of(-1, 0);
            case 4: return this.of(-1, -1);
            case 5: return this.of(1, -1);
            case 6: return this.of(-1, 1);
            case 7: return this.of(1, 1);
            default: throw new DirectionError('No Direction matching int ' + int);
        }
    }
}

export abstract class BaseDirection {
    public readonly x: 0|1|-1;
    public readonly y: 0|1|-1;
    public isDown(): boolean {
        return this.y === 1;
    }
    public isUp(): boolean {
        return this.y === -1;
    }
    public isLeft(): boolean {
        return this.x === -1;
    }
    public isRight(): boolean {
        return this.x === 1;
    }
    public equals(o: this): boolean {
        return this === o;
    }
    public toInt(): number {
        if (this.x === 0 && this.y === -1) return 0;
        if (this.x === 1 && this.y === 0) return 1;
        if (this.x === 0 && this.y === 1) return 2;
        if (this.x === -1 && this.y === 0) return 3;
        if (this.x === -1 && this.y === -1) return 4;
        if (this.x === 1 && this.y === -1) return 5;
        if (this.x === -1 && this.y === 1) return 6;
        if (this.x === 1 && this.y === 1) return 7;
        throw new DirectionError('Invalid direction');
    }
    public toString(): string {
        if (this.x === 0 && this.y === -1) return 'UP';
        if (this.x === 1 && this.y === 0) return 'RIGHT';
        if (this.x === 0 && this.y === 1) return 'DOWN';
        if (this.x === -1 && this.y === 0) return 'LEFT';
        if (this.x === -1 && this.y === -1) return 'UP_LEFT';
        if (this.x === 1 && this.y === -1) return 'UP_RIGHT';
        if (this.x === -1 && this.y === 1) return 'DOWN_LEFT';
        if (this.x === 1 && this.y === 1) return 'DOWN_RIGHT';
        throw new DirectionError('Invalid direction');
    }
}

export class Direction extends BaseDirection {
    public static readonly UP: Direction = new Direction(0, -1);
    public static readonly UP_RIGHT: Direction = new Direction(1, -1);
    public static readonly RIGHT: Direction = new Direction(1, 0);
    public static readonly DOWN_RIGHT: Direction = new Direction(1, 1);
    public static readonly DOWN: Direction = new Direction(0, 1);
    public static readonly DOWN_LEFT: Direction = new Direction(-1, 1);
    public static readonly LEFT: Direction = new Direction(-1, 0);
    public static readonly UP_LEFT: Direction = new Direction(-1, -1);
    public static readonly factory: DirectionFactory<Direction> =
        new class extends DirectionFactory<Direction> {
            public all: ReadonlyArray<Direction> = [
                Direction.UP,
                Direction.UP_RIGHT,
                Direction.RIGHT,
                Direction.DOWN_RIGHT,
                Direction.DOWN,
                Direction.DOWN_LEFT,
                Direction.LEFT,
                Direction.UP_LEFT,
            ];
        };
    public static readonly DIRECTIONS: ReadonlyArray<Direction> = Direction.factory.all;
    public static readonly encoder: Encoder<Direction> =
        Encoder.of((dir: Direction) => {
            return dir.toString();
        }, (encoded: JSONValue) => {
            assert(typeof encoded === 'string', 'Invalid encoded direction');
            return Direction.factory.fromString(encoded as string);
        });
    private constructor(public readonly x: 0|1|-1, public readonly y: 0|1|-1) {
        super();
    }
    public isDiagonal(): boolean {
        return (this.x !== 0) && (this.y !== 0);
    }
    public getOpposite(): Direction {
        return Direction.factory.of(-this.x, -this.y);
    }
}

export class Orthogonal extends BaseDirection {
    public static readonly UP: Orthogonal = new Orthogonal(0, -1);
    public static readonly RIGHT: Orthogonal = new Orthogonal(1, 0);
    public static readonly DOWN: Orthogonal = new Orthogonal(0, 1);
    public static readonly LEFT: Orthogonal = new Orthogonal(-1, 0);
    public static readonly factory: DirectionFactory<Orthogonal> =
        new class extends DirectionFactory<Orthogonal> {
            public all: ReadonlyArray<Orthogonal> = [
                Orthogonal.UP,
                Orthogonal.RIGHT,
                Orthogonal.DOWN,
                Orthogonal.LEFT,
            ];

            public of(x: number, y: number): Orthogonal {
                if (x === 0 && y === -1) return Orthogonal.UP;
                if (x === 1 && y === 0) return Orthogonal.RIGHT;
                if (x === 0 && y === 1) return Orthogonal.DOWN;
                if (x === -1 && y === 0) return Orthogonal.LEFT;
                throw new DirectionError('Invalid direction');
            }
        };
    public static readonly ORTHOGONALS: ReadonlyArray<Orthogonal> = Orthogonal.factory.all;
    public static readonly encoder: Encoder<Orthogonal> =
        Encoder.of((dir: Orthogonal) => {
            return dir.toString();
        }, (encoded: JSONValue) => {
            assert(typeof encoded === 'string', 'Invalid encoded orthogonal direction');
            return Orthogonal.factory.fromString(encoded as string);
        });

    private constructor(public readonly x: 0|1|-1, public readonly y: 0|1|-1) {
        super();
    }
    public getOpposite(): Orthogonal {
        return Orthogonal.factory.of(-this.x, -this.y);
    }
}
