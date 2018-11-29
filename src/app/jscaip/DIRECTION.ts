export let DIRECTION = {
	UP:        {x:  0, y: -1},
	UPRIGHT:   {x: +1, y: -1},
	RIGHT:     {x: +1, y:  0},
	DOWNRIGHT: {x: +1, y: +1},
	DOWN:      {x:  0, y: +1},
	DOWNLEFT:  {x: -1, y: +1},
	LEFT:      {x: -1, y:  0},
	UPLEFT:    {x: -1, y: -1}
};

export interface XY {
	readonly x: number;
	readonly y: number;
}

export const DIRECTIONS: ReadonlyArray<XY> = [
	{x: -1, y: -1},
	{x: -1, y:  0},
	{x: -1, y: +1},
	{x:  0, y: -1},
	{x:  0, y: +1},
	{x: +1, y: -1},
	{x: +1, y:  0},
	{x: +1, y: +1}
];
