import {MoveCoord} from './MoveCoord';
import { GamePartSlice } from './GamePartSlice';

export abstract class MoveCoordAndCapture<C> extends MoveCoord {
	/* is a MoveXY with added captures results
	 * the captures result help to retrieve in reverse order
	 * if XY cannot help you to reconstruct the part
	 */

	protected readonly captures: C[] ;

	constructor(x: number, y: number, captures: C[]) {
		super(x, y);
		this.captures = captures;
	}

	getCapturesCopy(): C[] {
		 return this.captures.map(x => Object.assign({}, x));
	}

	equals(obj: any): boolean {
		if (this === obj) {
			return true;
		}
		if (obj == null) {
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
		if (this.captures === null) {
			if (obj.captures !== null) {
				return false;
			}
		} else {
			if (this.captures[0] !== obj.captures[0]) {
				return false;
			}
			if (this.captures[1] !== obj.captures[1]) {
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
