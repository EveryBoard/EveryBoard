import {DIR_ARRAY, DIRECTION, ORTH_ARRAY, ORTHOGONALE} from './DIRECTION';

export class Coord {

	readonly x: number;

	readonly y: number;

	static getBinarised(n: number): -1 | 0 | 1 {
		// return a value as -1 if negatif, 0 if nul, 1 if positive
		if (n < 0) {
			return -1;
		}
		if (n === 0) {
			return 0;
		}
		if (n > 0) {
			return 1;
		}
	}

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	getNext(dir: DIRECTION): Coord {
		// return the next coord in the direction 'dir'
		return new Coord(this.x + dir.x, this.y + dir.y);
	}

	getPrevious(dir: DIRECTION): Coord {
		return new Coord(this.x - dir.x, this.y - dir.y);
	}

	getLeft(dir: DIRECTION): Coord {
		// looking in the direction "dir", we just go one step left
		// \  | /         x
		// <- O -> become x
		// /  | \         x
		//
		// (--) -> (-+)
		// (0-) -> (
	}

	isInRange(sizeX: number, sizeY: number): boolean {
		if (this.x < 0) {
			return false;
		}
		if (this.y < 0) {
			return false;
		}
		if (this.x >= sizeX) {
			return false;
		}
		if (this.y >= sizeY) {
			return false;
		}
		return true;
	}

	getDirectionToward(c: Coord): DIRECTION {
		const dx: number = Coord.getBinarised(this.x - c.x) + 1;
		const dy: number = Coord.getBinarised(this.y - c.y) + 1;
		return DIR_ARRAY[dy][dx];
	}

	getOrthogonalDirectionToward(c: Coord): ORTHOGONALE {
		const dx: number = Coord.getBinarised(this.x - c.x) + 1;
		const dy: number = Coord.getBinarised(this.y - c.y) + 1;
		return ORTH_ARRAY[dy][dx];
	}

	getOrthogonalDistance(c: Coord): number {
		return (this.x - c.x) + (this.y - c.y);
	}

	equals(obj: any): boolean {
		if (this === obj) {
			return true;
		}
		if (obj === null) {
			return false;
		}
		if (!(obj instanceof Coord)) {
			return false;
		}
		const other: Coord = obj as Coord;
		if (other.x !== this.x) {
			return false;
		}
		if (this.y !== other.y) {
			return false;
		}
		return true;
	}

	toString(): string {
		return '(' + this.x + ', ' + this.y + ')';
	}

}
