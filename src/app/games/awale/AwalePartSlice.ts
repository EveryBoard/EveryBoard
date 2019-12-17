import {GamePartSlice} from '../../jscaip/GamePartSlice';

export class AwalePartSlice extends GamePartSlice {

	captured = [0, 0];

	constructor(b: number[][], turn: number, captured: number[]) {
		super(b, turn);
		this.captured = captured;
	}

	static getStartingBoard(): number[][] {
		const board: number[][] = GamePartSlice.createBiArray(6, 2, 4);
		return board;
	}

	getCapturedCopy(): number[] {
		return [this.captured[0], this.captured[1]];
	}
}
