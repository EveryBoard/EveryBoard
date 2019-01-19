import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {P4Rules} from './P4Rules';

export class P4PartSlice extends GamePartSlice {
	// constructors :

	// constructor() {
	// super(getStartingBoard(), 0);
	// }

	constructor(b: number[][], turn: number) {
		if (b == null) {
			b = P4PartSlice.getStartingBoard();
		}
		super(b, turn);
	}

	// statics :

	static getStartingBoard(): number[][] {
		const board: number[][] = GamePartSlice.createBiArray(7, 6, P4Rules.UNOCCUPIED);
		return board;
	}

}
