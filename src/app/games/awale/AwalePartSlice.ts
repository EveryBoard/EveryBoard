import {GamePartSlice} from '../../jscaip/GamePartSlice';

export class AwalePartSlice extends GamePartSlice {

	constructor(b: number[][], turn: number, public captured: ReadonlyArray<number>) {
		super(b, turn);
		if (captured == null) throw new Error("Captured cannot be null");
		if (captured.length !== 2) throw new Error("Captured must be of length 2");
	}
	public static getStartingBoard(): number[][] {
		const board: number[][] = GamePartSlice.createBiArray(6, 2, 4);
		return board;
	}
	public getCapturedCopy(): number[] {
		return [this.captured[0], this.captured[1]];
	}
}