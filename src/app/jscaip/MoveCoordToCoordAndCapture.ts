import {MoveCoord} from './MoveCoord';
import {Coord} from './Coord';

export class MoveCoordToCoordAndCapture extends MoveCoord {

	// non static fields :

	readonly end: Coord;

	private captures: Coord[];

	constructor(c: Coord, e: Coord) {
		super(c.x, c.y);
		this.end = e;
	}

	setCaptures(c: Coord[]) {
		this.captures = c;
	}

	getCaptures(i: number): Coord {
		return this.captures[i];
	}

	toString() {
		return 'MC->C&C [coord = ' + this.coord.toString() + ' to ' + this.end.toString() + ']';
	}

	equals(obj: any): boolean {
		if (this === obj) {
			return true;
		}
		if (obj === null) {
			return false;
		}
		if (!(obj instanceof MoveCoordToCoordAndCapture)) {
			return false;
		}
		if (this.coord === null) {
			if (obj.coord !== null) {
				return false;
			}
		} else {
			if (!this.coord.equals(obj.coord)) {
				return false;
			}
		}
		if (this.end === null) {
			if (obj.end !== null) {
				return false;
			}
		} else {
			if (!this.end.equals(obj.end)) {
				return false;
			}
		}
		return true;
	}

}
