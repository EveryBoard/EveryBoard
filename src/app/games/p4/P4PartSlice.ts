import {GamePartSlice} from '../../jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';

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
		const board: number[][] = GamePartSlice.createBiArray(7, 6, Player.NONE.value);
		return board;
	}

}
