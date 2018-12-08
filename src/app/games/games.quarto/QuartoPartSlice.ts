import {GamePartSlice} from '../../jscaip/GamePartSlice';

export class QuartoPartSlice extends GamePartSlice {

	// private QuartoEnum[] pawns; enlevé pour optimisation mémoire

	readonly pieceInHand: number; // the piece that the previous player gave you to put

	constructor(b: number[][], turn: number, pieceInHand: number) {
		super(b, turn);
		this.pieceInHand = pieceInHand;
	}

	static getInitialBoard(): QuartoPartSlice {
		const partSlice: QuartoPartSlice = new QuartoPartSlice(
			GamePartSlice.createBiArray(4, 4, QuartoEnum.UNOCCUPIED.getValue()),
		0,
			QuartoEnum.AAAA.getValue());
	//this.board[0][0] = QuartoEnum.AAAA.getValue();
	//this.board[1][0] = QuartoEnum.AAAB.getValue();
	//this.board[2][0] = QuartoEnum.AABA.getValue();
	//this.board[3][0] = QuartoEnum.AABB.getValue();
	return partSlice;
	// 0--- en 3, 3
	// 00-- en 2, 1
	// safe : 1101 1110
}

public static List<QuartoEnum> getFullPawnsList() {
	QuartoEnum[] all = QuartoEnum.values();
	List<QuartoEnum> filtered = new ArrayList<QuartoEnum>(16);
	for (QuartoEnum q : all) {
		if (q != QuartoEnum.UNOCCUPIED) {
			filtered.add(q);
		}
	}
	return filtered;
}

public static boolean isGivable(int pawn, int[][] board, int pieceInHand) {
	if (pawn == pieceInHand) {
		return false;
	}
	return QuartoPartSlice.isPlacable(pawn, board);
}

public static boolean isPlacable(int pawn, int[][] board) {
	// return true if the pawn is not already placed on the board
	boolean found = false;
	int indexY = 0;
	int indexX;
	while (!found && (indexY<4)) {
		indexX = 0;
		while (!found && (indexX<4)) {
			found = board[indexY][indexX]==pawn;
			indexX++;
		}
		indexY++;
	}
	return !found;
}

public List<QuartoEnum> getRemainingPawns() {
	// return the pawn that are nor on the board nor the one that you have in your hand
	// (hence, the one that your about to put on the board)
	List<QuartoEnum> allPawn = QuartoPartSlice.getFullPawnsList();
	List<QuartoEnum> remainingPawns = new ArrayList<>();
	for (QuartoEnum quartoEnum : allPawn) {
		if (QuartoPartSlice.isGivable(quartoEnum.getValue(), this.board, this.pieceInHand)){
			remainingPawns.add(quartoEnum);
		}
	}
	return remainingPawns;
}
}
