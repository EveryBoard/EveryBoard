import { Coord } from "./coord/Coord";

export class Orthogonale {

    public static readonly UP: Orthogonale = new Orthogonale(0, -1);

    public static readonly RIGHT: Orthogonale = new Orthogonale(1, 0);

    public static readonly DOWN: Orthogonale = new Orthogonale(0, 1);

    public static readonly LEFT: Orthogonale = new Orthogonale(-1, 0);

    public static readonly ORTHOGONALES = [Orthogonale.UP, Orthogonale.RIGHT, Orthogonale.DOWN, Orthogonale.LEFT];

    public static fromInt(int: number): Orthogonale {
        switch (int) {
            case 0: return Orthogonale.UP;
            case 1: return Orthogonale.RIGHT;
            case 2: return Orthogonale.DOWN;
            case 3: return Orthogonale.LEFT;
            default: throw new Error("No Orthogonale matching int " + int);
        }
    }
    public static fromString(str: string): Orthogonale {
        switch (str) {
            case "UP":    return Orthogonale.UP;
            case "RIGHT": return Orthogonale.RIGHT;
            case "DOWN":  return Orthogonale.DOWN;
            case "LEFT":  return Orthogonale.LEFT;
            default: throw new Error("Unknown direction " + str);
        }
    }
    private constructor(public readonly x: number, public readonly y: number) {}

    public getOpposite(): Orthogonale {
        switch (this) {
            case Orthogonale.UP:    return Orthogonale.DOWN;
            case Orthogonale.RIGHT: return Orthogonale.LEFT;
            case Orthogonale.DOWN:  return Orthogonale.UP;
            case Orthogonale.LEFT:  return Orthogonale.RIGHT;
        }
    }
    public toString(): string {
        switch (this) {
            case Orthogonale.UP:    return "UP";
            case Orthogonale.RIGHT: return "RIGHT";
            case Orthogonale.DOWN:  return "DOWN";
            case Orthogonale.LEFT:  return "LEFT";
        }
    }
    public toInt(): number {
        switch (this) {
            case Orthogonale.UP:    return 0;
            case Orthogonale.RIGHT: return 1;
            case Orthogonale.DOWN:  return 2;
            case Orthogonale.LEFT:  return 3;
        }
    }
}
export class Direction {

    public static readonly UP: Direction = new Direction(0, -1);

    public static readonly UP_RIGHT: Direction = new Direction(1, -1);

    public static readonly RIGHT: Direction = new Direction(1, 0);

    public static readonly DOWN_RIGHT: Direction = new Direction(1, 1);

    public static readonly DOWN: Direction = new Direction(0, 1);

    public static readonly DOWN_LEFT: Direction = new Direction(-1, 1);

    public static readonly LEFT: Direction = new Direction(-1, 0);

    public static readonly UP_LEFT: Direction = new Direction(-1, -1);

    public static readonly DIRECTIONS: ReadonlyArray<Direction> = [Direction.UP, Direction.UP_RIGHT, Direction.RIGHT, Direction.DOWN_RIGHT,
                                                                   Direction.DOWN, Direction.DOWN_LEFT, Direction.LEFT, Direction.UP_LEFT];

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
            default: throw new Error("Unknown direction: " + this.toString());
        }
    }
    public static equals(first: Direction, second: Direction): boolean {
        if (first == null) {
            if (second == null) return true;
            else return false;
        } else {
            if (second == null) return false;
            return (first.x === second.x) && (first.y === second.y);
        }
    }
    public static isOrthogonal(d: Direction): boolean {
        return (d.x === 0) || (d.y === 0);
    }
    public static isDiagonal(d: Direction): boolean {
        return (d.x !== 0) && (d.y !== 0);
    }
    public static fromDelta(dx: number, dy: number): Direction {
        if (dx === 0 && dy === 0) {
            throw new Error("Invalid direction from static move");
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
        throw new Error("Invalid direction from delta dx:" + dx + ", dy:" + dy);
    }
    public static of(x: number, y: number): Direction {
        return Direction.fromDelta(x, y);
    }
    public static fromMove(start: Coord, end: Coord): Direction {
        return Direction.fromDelta(end.x - start.x, end.y - start.y);
    }
    private constructor(public readonly x: number, public readonly y: number) {}
}
