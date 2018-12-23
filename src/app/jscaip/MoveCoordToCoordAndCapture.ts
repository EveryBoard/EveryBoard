import {MoveCoord} from './MoveCoord';
import {Coord} from './Coord';

export class MoveCoordToCoordAndCapture extends MoveCoord {

	// non static fields :

	readonly end: Coord ;

	private captures: Coord[] ;

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

}
