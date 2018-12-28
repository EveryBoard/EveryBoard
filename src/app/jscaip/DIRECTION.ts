export type ORTHOGONALE =
	{x:  0; y: -1} | // UP
	{x:  1; y:  0} | // RIGHT
	{x:  0; y:  1} | // DOWN
	{x: -1, y:  0};  // LEFT

export type DIRECTION =
	{x:  0, y: -1} | // UP
	{x:  1, y: -1} | // UPRIGHT
	{x:  1, y:  0} | // RIGHT
	{x:  1, y:  1} | // DOWNRIGHT
	{x:  0, y:  1} | // DOWN
	{x: -1, y:  1} | // DOWNLEFT
	{x: -1, y:  0} | // LEFT
	{x: -1, y: -1};  // UPLEFT

export namespace DIRECTION {
	export function equals(first: DIRECTION, second: DIRECTION): boolean {
		return (first.x === second.x) && (first.y === second.y);
	}
	export function isOrthogonal(d: DIRECTION) {
		return (d.x === 0) || (d.y === 0);
	}
	export function getOpposite(dir: DIRECTION): DIRECTION {
		const index: number = DIRECTIONS.indexOf(dir);
		return DIRECTIONS[(index + 4) % 8];
	}
}

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

export interface XY {
	readonly x: number;
	readonly y: number;
}

export const DIRECTIONS: ReadonlyArray<DIRECTION> = [
	{x: -1, y: -1},
	{x:  0, y: -1},
	{x: +1, y: -1},
	{x: +1, y:  0},
	{x: +1, y: +1},
	{x:  0, y: +1},
	{x: -1, y: +1},
	{x: -1, y:  0},
];

export const ORTHOGONALES: ReadonlyArray<ORTHOGONALE> = [
	{x:  0, y: -1},
	{x: +1, y:  0},
	{x:  0, y: +1},
	{x: -1, y:  0}
];

export const DIR_ARRAY: ReadonlyArray<ReadonlyArray<DIRECTION | null>> = [
	[ {x: -1, y: -1}, {x:  0, y: -1}, {x:  1, y: -1} ],
	[ {x: -1, y:  0},			 null, {x:  1, y:  0} ],
	[ {x: -1, y:  1}, {x:  0, y:  1}, {x:  1, y:  1} ]
];

export const ORTH_ARRAY: ReadonlyArray<ReadonlyArray<ORTHOGONALE | null>> = [
	[           null, {x:  0, y: -1},           null ],
	[ {x: -1, y:  0},			 null, {x:  1, y:  0} ],
	[           null, {x:  0, y:  1},           null ]
];
