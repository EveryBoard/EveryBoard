import { GamePartSlice } from '../../jscaip/GamePartSlice';
import { QuartoEnum } from './QuartoEnum';
import { ArrayUtils, NumberTable } from 'src/app/collectionlib/arrayutils/ArrayUtils';

export class QuartoPartSlice extends GamePartSlice {
    constructor(b: number[][], turn: number, public readonly pieceInHand: number) {
        super(b, turn);
    }
    public static getInitialSlice(): QuartoPartSlice {
        const board: number[][] = ArrayUtils.createBiArray(4, 4, QuartoEnum.UNOCCUPIED);
        return new QuartoPartSlice(board, 0, QuartoEnum.AAAA);
    }
    public static getFullPawnsList(): Array<QuartoEnum> {
        const all: QuartoEnum[] = QuartoEnum.values();
        const filtered: Array<QuartoEnum> = [];
        for (const q of all) {
            if (q !== QuartoEnum.UNOCCUPIED) {
                filtered.push(q);
            }
        }
        return filtered;
    }
    public static isGivable(pawn: number, board: NumberTable, pieceInHand: number): boolean {
        if (pawn === pieceInHand) {
            return false;
        }
        return QuartoPartSlice.isPlacable(pawn, board);
    }
    public static isPlacable(pawn: number, board: NumberTable): boolean {
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
        const remainingPawns: Array<QuartoEnum> = [];
        for (const quartoEnum of allPawn) {
            if (QuartoPartSlice.isGivable(quartoEnum, this.board, this.pieceInHand)) {
                remainingPawns.push(quartoEnum);
            }
        }
        return remainingPawns;
    }
}
