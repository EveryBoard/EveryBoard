import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {QuartoEnum} from './QuartoEnum';

export class QuartoPartSlice extends GamePartSlice {

	// private QuartoEnum[] pawns; enlevé pour optimisation mémoire

	readonly pieceInHand: number; // the piece that the previous player gave you to put

	constructor(b: number[][], turn: number, pieceInHand: number) {
		super(b, turn);
		this.pieceInHand = pieceInHand;
	}

	static getInitialBoard(): QuartoPartSlice {
		const partSlice: QuartoPartSlice = new QuartoPartSlice(
			GamePartSlice.createBiArray(4, 4, QuartoEnum.UNOCCUPIED),
		0,
			QuartoEnum.AAAA);
		// this.board[0][0] = QuartoEnum.AAAA.getValue();
		// this.board[1][0] = QuartoEnum.AAAB.getValue();
		// this.board[2][0] = QuartoEnum.AABA.getValue();
		// this.board[3][0] = QuartoEnum.AABB.getValue();
		return partSlice;
	}

	static getFullPawnsList(): Array<QuartoEnum> {
		const all: QuartoEnum[] = QuartoEnum.values();
		const filtered: Array<QuartoEnum> = new Array<QuartoEnum>(16);
		for (const q of all) {
			if (q !== QuartoEnum.UNOCCUPIED) {
				filtered.push(q);
			}
		}
		return filtered;
	}

	static isGivable(pawn: number, board: number[][], pieceInHand: number): boolean {
		if (pawn === pieceInHand) {
			return false;
		}
		return QuartoPartSlice.isPlacable(pawn, board);
	}

	static isPlacable(pawn: number, board: number[][]): boolean {
		// return true if the pawn is not already placed on the board
		let found = false;
		let indexY = 0;
		let indexX: number;
		while (!found && (indexY < 4)) {
			indexX = 0;
			while (!found && (indexX < 4)) {
				found = board[indexY][indexX] === pawn;
				indexX++;
			}
			indexY++;
		}
		return !found;
	}

	public getRemainingPawns(): Array<QuartoEnum> {
		// return the pawn that are nor on the board nor the one that you have in your hand
		// (hence, the one that your about to put on the board)
		const allPawn: Array<QuartoEnum> = QuartoPartSlice.getFullPawnsList();
		const remainingPawns: Array<QuartoEnum> = new Array<QuartoEnum>();
		for (const quartoEnum of allPawn) {
			if (QuartoPartSlice.isGivable(quartoEnum, this.board, this.pieceInHand)){
				remainingPawns.push(quartoEnum);
			}
		}
		return remainingPawns;
	}
}
