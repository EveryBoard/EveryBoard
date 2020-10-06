import { environment } from "src/environments/environment";
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
    public static of(x: number, y: number): Direction {
        if (x === -1) {
            if (y === -1) return Direction.UP_LEFT;
            if (y === 0) return Direction.LEFT;
            if (y === 1) return Direction.DOWN_LEFT;
        } else if (x === 0) {
            if (y === -1) return Direction.UP;
            if (y === 1) return Direction.DOWN;
        } else if (x === 1) {
            if (y === -1) return Direction.UP_RIGHT;
            if (y === 0) return Direction.RIGHT;
            if (y === 1) return Direction.DOWN_RIGHT;
        } else {
            throw new Error("Invalid argument for Direction (x = " + x + ")");
        }
        throw new Error("Invalid argument for Direction (y = " + y + ")")
    }
    public static fromMove(start: Coord, end: Coord): Direction {
        if (start.x === end.x && start.y === end.y) {
            throw new Error("Invalid direction from static move");
        } else if (start.x === end.x) {
            // Vertical move
            if (start.y < end.y) return Direction.DOWN;
            if (start.y > end.y) return Direction.UP;
        } else if (start.y === end.y) {
            // Horizontal move
            if (start.x < end.x) return Direction.RIGHT;
            if (start.y > end.y) return Direction.LEFT;
        } else if (Math.abs(start.x - end.x) === Math.abs(start.y - end.y)) {
            // Diagonal move
            if (start.x < end.x && start.y < end.y) return Direction.DOWN_RIGHT;
            if (start.x < end.x && start.y > end.y) return Direction.UP_RIGHT;
            if (start.x > end.x && start.y < end.y) return Direction.DOWN_LEFT;
            if (start.x > end.x && start.y > end.y) return Direction.UP_LEFT;
        }
        throw new Error("Invalid direction from move: " + start.toString() + "->" + end.toString());
    }
    private constructor(public readonly x: number, public readonly y: number) {}
}
/*export type _DIRECTION =
    {x:  0, y: -1} | // UP
    {x:  1, y: -1} | // UPRIGHT
    {x:  1, y:  0} | // RIGHT
    {x:  1, y:  1} | // DOWNRIGHT
    {x:  0, y:  1} | // DOWN
    {x: -1, y:  1} | // DOWNLEFT
    {x: -1, y:  0} | // LEFT
    {x: -1, y: -1};  // UPLEFT

export namespace _DIRECTION {
    export function equals(first: _DIRECTION, second: _DIRECTION): boolean {
        return (first.x === second.x) && (first.y === second.y);
    }
    export function _isOrthogonal(d: _DIRECTION) {
        return (d.x === 0) || (d.y === 0);
    }
    export function getOpposite(dir: _DIRECTION): _DIRECTION {
        const index: number = _DIRECTIONS.indexOf(dir);
        return _DIRECTIONS[(index + 4) % 8];
    }
    export function toString(dir: _DIRECTION): string {
        return "DIRECTION(" + dir.x + ", " + dir.y + ")";
    }
}
*/
/* export let DIRECTION = {
    UP:        {x:  0, y: -1},
    UPRIGHT:   {x: +1, y: -1},
    RIGHT:     {x: +1, y:  0},
    DOWNRIGHT: {x: +1, y: +1},
    DOWN:      {x:  0, y: +1},
    DOWNLEFT:  {x: -1, y: +1},
    LEFT:      {x: -1, y:  0},
    UPLEFT:    {x: -1, y: -1}
} */
/*
export interface XY {
    readonly x: number;
    readonly y: number;
}
*/
/* triées dans l'ordre horloger de sorte que DIRECTIONS[i]
 * soit la direction opposée à DIRECTIONS[i+1]
 * changer l'ordre affecterait le puissance 4
 */
/*
export const _DIRECTIONS: ReadonlyArray<_DIRECTION> = [
    {x: -1, y: -1},
    {x:  0, y: -1},
    {x: +1, y: -1},
    {x: +1, y:  0},
    {x: +1, y: +1},
    {x:  0, y: +1},
    {x: -1, y: +1},
    {x: -1, y:  0},
];
export const _ORTHOGONALES: ReadonlyArray<_ORTHOGONALE> = [
    {x:  0, y: -1},
    {x: +1, y:  0},
    {x:  0, y: +1},
    {x: -1, y:  0}
];
export const DIR_ARRAY: ReadonlyArray<ReadonlyArray<_DIRECTION | null>> = [
    [ {x: -1, y: -1}, {x:  0, y: -1}, {x:  1, y: -1} ],
    [ {x: -1, y:  0},             null, {x:  1, y:  0} ],
    [ {x: -1, y:  1}, {x:  0, y:  1}, {x:  1, y:  1} ]
];
export const ORTH_ARRAY: ReadonlyArray<ReadonlyArray<_ORTHOGONALE | null>> = [
    [           null, {x:  0, y: -1},           null ],
    [ {x: -1, y:  0},             null, {x:  1, y:  0} ],
    [           null, {x:  0, y:  1},           null ]
];
*/