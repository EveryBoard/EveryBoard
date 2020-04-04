import {GamePartSlice} from '../../jscaip/GamePartSlice';
import { Player } from 'src/app/jscaip/Player';

export class P4PartSlice extends GamePartSlice {

	// statics :

	public static getStartingBoard(): number[][] {
		const board: number[][] = GamePartSlice.createBiArray(7, 6, Player.NONE.value);
		return board;
	}
}