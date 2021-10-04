import { RectangularGameState } from 'src/app/jscaip/RectangularGameState';
import { SiamPiece } from './SiamPiece';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class SiamState extends RectangularGameState<SiamPiece> {

    public static getInitialState(): SiamState {
        const board: SiamPiece[][] = ArrayUtils.createTable(5, 5, SiamPiece.EMPTY);

        board[2][1] = SiamPiece.MOUNTAIN;
        board[2][2] = SiamPiece.MOUNTAIN;
        board[2][3] = SiamPiece.MOUNTAIN;

        return new SiamState(board, 0);
    }
    public countPlayerPawn(): number {
        let count: number = 0;
        for (let y: number = 0; y < 5; y++) {
            for (let x: number = 0; x < 5; x++) {
                if (this.board[y][x].belongTo(this.getCurrentPlayer())) {
                    count++;
                }
            }
        }
        return count;
    }
}
