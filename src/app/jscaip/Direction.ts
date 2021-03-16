import { Coord } from './coord/Coord';
import { Encoder } from './encoder';

abstract class AbstractDirection {
    public readonly x: -1|0|1;
    public readonly y: -1|0|1;
}

export abstract class DirectionFactory<T extends AbstractDirection> {
    public abstract of(x: number, y: number): T;
    public fromDelta(dx: number, dy: number): T {
        if (dx === 0 && dy === 0) {
            throw new Error('Invalid direction from static move');
        } else if (dx === 0) {
            return this.of(0, Math.sign(dy));
        } else if (dy === 0) {
            return this.of(Math.sign(dx), 0);
        } else if (Math.abs(dx) === Math.abs(dy)) {
            return this.of(Math.sign(dx), Math.sign(dy));
        }
        throw new Error('Invalid direction from delta dx:' + dx + ', dy:' + dy);
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
            default: throw new Error('Unknown direction ' + str);
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
            default: throw new Error('No Direction matching int ' + int);
        }
    }
    public oppositeOf(dir: T): T {
        return this.of(-dir.x, -dir.y);
    }
}

export abstract class BaseDirection {
    public readonly x: 0|1|-1;
    public readonly y: 0|1|-1;
    public isDiagonal(): boolean {
        return (this.x !== 0) && (this.y !== 0);
    }
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
        throw new Error('Invalid direction');
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
        throw new Error('Invalid direction');
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
    public static readonly DIRECTIONS: ReadonlyArray<Direction> = [
        Direction.UP,
        Direction.UP_RIGHT,
        Direction.RIGHT,
        Direction.DOWN_RIGHT,
        Direction.DOWN,
        Direction.DOWN_LEFT,
        Direction.LEFT,
        Direction.UP_LEFT,
    ];
    public static readonly factory: DirectionFactory<Direction> =
        new class extends DirectionFactory<Direction> {
            public of(x: number, y: number): Direction {
                if (x === 0 && y === -1) return Direction.UP;
                if (x === 1 && y === 0) return Direction.RIGHT;
                if (x === 0 && y === 1) return Direction.DOWN;
                if (x === -1 && y === 0) return Direction.LEFT;
                if (x === -1 && y === -1) return Direction.UP_LEFT;
                if (x === 1 && y === -1) return Direction.UP_RIGHT;
                if (x === -1 && y === 1) return Direction.DOWN_LEFT;
                if (x === 1 && y === 1) return Direction.DOWN_RIGHT;
                throw new Error('Invalid direction');
            }
        };
    public static readonly encoder: Encoder<Direction> =
        Encoder.of(7, (dir: Direction) => {
            return dir.toInt();
        }, (n: number) => {
            return Direction.factory.fromInt(n);
        });
    private constructor(public readonly x: 0|1|-1, public readonly y: 0|1|-1) {
        super();
    }
}

export class Orthogonal extends BaseDirection {
    public static readonly UP: Orthogonal = new Orthogonal(0, -1);
    public static readonly RIGHT: Orthogonal = new Orthogonal(1, 0);
    public static readonly DOWN: Orthogonal = new Orthogonal(0, 1);
    public static readonly LEFT: Orthogonal = new Orthogonal(-1, 0);
    public static readonly ORTHOGONALS: ReadonlyArray<Orthogonal> = [
        Orthogonal.UP,
        Orthogonal.RIGHT,
        Orthogonal.DOWN,
        Orthogonal.LEFT,
    ];
    public static readonly factory: DirectionFactory<Orthogonal> =
        new class extends DirectionFactory<Orthogonal> {
            public of(x: number, y: number): Orthogonal {
                if (x === 0 && y === -1) return Orthogonal.UP;
                if (x === 1 && y === 0) return Orthogonal.RIGHT;
                if (x === 0 && y === 1) return Orthogonal.DOWN;
                if (x === -1 && y === 0) return Orthogonal.LEFT;
                throw new Error('Invalid direction');
            }
        };
    public static readonly encoder: Encoder<Orthogonal> =
        Encoder.of(7, (dir: Orthogonal) => {
            return dir.toInt();
        }, (n: number) => {
            return Orthogonal.factory.fromInt(n);
        });
    private constructor(public readonly x: 0|1|-1, public readonly y: 0|1|-1) {
        super();
    }
}
