import { Coord } from './coord/Coord';

export class Direction {
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
    public static fromDelta(dx: number, dy: number): Direction {
        if (dx === 0 && dy === 0) {
            throw new Error('Invalid direction from static move');
        } else if (dx === 0) {
            // Vertical move
            if (dy > 0) return Direction.DOWN;
            if (dy < 0) return Direction.UP;
        } else if (dy === 0) {
            // Horizontal move
            if (dx > 0) return Direction.RIGHT;
            if (dx < 0) return Direction.LEFT;
        } else if (Math.abs(dx) === Math.abs(dy)) {
            // Diagonal move
            if (dx > 0 && dy > 0) return Direction.DOWN_RIGHT;
            if (dx > 0 && dy < 0) return Direction.UP_RIGHT;
            if (dx < 0 && dy > 0) return Direction.DOWN_LEFT;
            if (dx < 0 && dy < 0) return Direction.UP_LEFT;
        }
        throw new Error('Invalid direction from delta dx:' + dx + ', dy:' + dy);
    }
    public static of(x: number, y: number): Direction {
        return Direction.fromDelta(x, y);
    }
    public static fromMove(start: Coord, end: Coord): Direction {
        return Direction.fromDelta(end.x - start.x, end.y - start.y);
    }
    public static fromInt(int: number): Direction {
        switch (int) {
        case 0: return Direction.UP;
        case 1: return Direction.RIGHT;
        case 2: return Direction.DOWN;
        case 3: return Direction.LEFT;
        case 4: return Direction.UP_LEFT;
        case 5: return Direction.UP_RIGHT;
        case 6: return Direction.DOWN_LEFT;
        case 7: return Direction.DOWN_RIGHT;
        default: throw new Error('No Direction matching int ' + int);
        }
    }
    public static fromString(str: string): Direction {
        switch (str) {
        case 'UP': return Direction.UP;
        case 'RIGHT': return Direction.RIGHT;
        case 'DOWN': return Direction.DOWN;
        case 'LEFT': return Direction.LEFT;
        case 'UP_LEFT': return Direction.UP;
        case 'UP_RIGHT': return Direction.RIGHT;
        case 'DOWN_LEFT': return Direction.DOWN;
        case 'DOWN_RIGHT': return Direction.LEFT;
        default: throw new Error('Unknown direction ' + str);
        }
    }
    public toInt(): number {
        switch (this) {
        case Direction.UP: return 0;
        case Direction.RIGHT: return 1;
        case Direction.DOWN: return 2;
        case Direction.LEFT: return 3;
        case Direction.UP_LEFT: return 4;
        case Direction.UP_RIGHT: return 5;
        case Direction.DOWN_LEFT: return 6;
        case Direction.DOWN_RIGHT: return 7;
        }
    }
    public getOpposite(): Direction {
        switch (this) {
        case Direction.UP: return Direction.DOWN;
        case Direction.UP_RIGHT: return Direction.DOWN_LEFT;
        case Direction.RIGHT: return Direction.LEFT;
        case Direction.DOWN_RIGHT: return Direction.UP_LEFT;
        case Direction.DOWN: return Direction.UP;
        case Direction.DOWN_LEFT: return Direction.UP_RIGHT;
        case Direction.LEFT: return Direction.RIGHT;
        case Direction.UP_LEFT: return Direction.DOWN_RIGHT;
        default: throw new Error('Unknown direction: ' + this.toString());
        }
    }
    public isDiagonal(): boolean {
        return (this.x !== 0) && (this.y !== 0);
    }
    public toString(): string {
        switch (this) {
        case Direction.UP: return 'UP';
        case Direction.RIGHT: return 'RIGHT';
        case Direction.DOWN: return 'DOWN';
        case Direction.LEFT: return 'LEFT';
        case Direction.UP_LEFT: return 'UP_LEFT';
        case Direction.UP_RIGHT: return 'UP_RIGHT';
        case Direction.DOWN_LEFT: return 'DOWN_LEFT';
        case Direction.DOWN_RIGHT: return 'DOWN_RIGHT';
        default: throw Error('Non-existant direction.');
        }
    }
    public equals(o: Direction): boolean {
        return this === o;
    }
    protected constructor(public readonly x: number, public readonly y: number) {}
}
export class Orthogonal extends Direction {
    public static readonly UP: Orthogonal = Direction.UP;

    public static readonly RIGHT: Orthogonal = Direction.RIGHT;

    public static readonly DOWN: Orthogonal = Direction.DOWN;

    public static readonly LEFT: Orthogonal = Direction.LEFT;

    public static readonly ORTHOGONALS = [Orthogonal.UP, Orthogonal.RIGHT, Orthogonal.DOWN, Orthogonal.LEFT];
}
