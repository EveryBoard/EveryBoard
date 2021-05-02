import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { SiamPiece } from './SiamPiece';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';

export class SiamPartSlice extends GamePartSlice {
    public static getInitialSlice(): SiamPartSlice {
        const board: number[][] = ArrayUtils.createBiArray(5, 5, SiamPiece.EMPTY.value);

        board[2][1] = SiamPiece.MOUNTAIN.value;
        board[2][2] = SiamPiece.MOUNTAIN.value;
        board[2][3] = SiamPiece.MOUNTAIN.value;

        return new SiamPartSlice(board, 0);
    }
    public countPlayerPawn(): number {
        let count = 0;
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                if (SiamPiece.belongTo(this.board[y][x], this.getCurrentPlayer())) {
                    count++;
                }
            }
        }
        return count;
    }
}
