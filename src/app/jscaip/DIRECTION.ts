import { Dir } from "@angular/cdk/bidi";

/*export type _ORTHOGONALE =
    {x:  0; y: -1} | // UP
    {x:  1; y:  0} | // RIGHT
    {x:  0; y:  1} | // DOWN
    {x: -1, y:  0};  // LEFT
*/
export class Orthogonale {

    public static readonly UP: Orthogonale = new Orthogonale(0, -1);

    public static readonly RIGHT: Orthogonale = new Orthogonale(1, 0);

    public static readonly DOWN: Orthogonale = new Orthogonale(0, 1);

    public static readonly LEFT: Orthogonale = new Orthogonale(-1, 0);

    public static readonly ORTHOGONALES = [Orthogonale.UP, Orthogonale.RIGHT, Orthogonale.DOWN, Orthogonale.LEFT];

    private constructor(public readonly x: number, public readonly y: number) {}
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

    public static getOpposite(d: Direction): Direction {
        switch (d) {
            case Direction.UP: return Direction.DOWN;
            case Direction.UP_RIGHT: return Direction.DOWN_LEFT;
            case Direction.RIGHT: return Direction.LEFT;
            case Direction.DOWN_RIGHT: return Direction.UP_LEFT;
            case Direction.DOWN: return Direction.UP;
            case Direction.DOWN_LEFT: return Direction.UP_RIGHT;
            case Direction.LEFT: return Direction.RIGHT;
            case Direction.UP_LEFT: return Direction.DOWN_RIGHT;
        }
    }
    public static equals(first: Direction, second: Direction): boolean {
        return (first.x === second.x) && (first.y === second.y);
    }
    public static isOrthogonal(d: Direction): boolean {
        return (d.x === 0) || (d.y === 0);
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