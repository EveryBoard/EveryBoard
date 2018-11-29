import {MoveCoord} from './MoveCoord';

export class MoveCoordAndCapture extends MoveCoord {
	/* is a MoveXY with added captures results
	 * the captures result help to retrieve in reverse order
	 * if XY cannot help you to reconstruct the part
	 */

	protected readonly capture: number[] ;

	constructor(x: number, y: number, capture: number[]) {
		super(x, y);
		this.capture = capture;
	}

	getCapture(): number[] {
		return this.capture;
	}

	equals(obj: any): boolean {
		if (this === obj) {
			return true;
		}
		if (obj === null) {
			return false;
		}
		if (!(obj instanceof MoveCoordAndCapture)) {
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
		if (this.capture === null) {
			if (obj.capture !== null) {
				return false;
			}
		} else {
			if (this.capture[0] !== obj.capture[0]) {
				return false;
			}
			if (this.capture[1] !== obj.capture[1]) {
				return false;
			}
		}
		return true;
	}

	/*public String toString() {
		return "MoveXYC [capture=" + Arrays.toString(capture) + ", y=" + y + ", x=" + x + "]";
		}
		*/
}
