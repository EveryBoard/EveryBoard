import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { SiamPiece } from './SiamPiece';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';

export class SiamState extends GameStateWithTable<SiamPiece> {

    public static getInitialState(): SiamState {
        const board: SiamPiece[][] = ArrayUtils.createTable(5, 5, SiamPiece.EMPTY);

        board[2][1] = SiamPiece.MOUNTAIN;
        board[2][2] = SiamPiece.MOUNTAIN;
        board[2][3] = SiamPiece.MOUNTAIN;

        return new SiamState(board, 0);
    }
    public static isOnBoard(coord: Coord): boolean {
        return coord.isInRange(5, 5);
    }
    public countCurrentPlayerPawn(): number {
        return this.countPlayersPawn()[this.getCurrentPlayer().value];
    }
    public countPlayersPawn(): [number, number] {
        const counts: [number, number] = [0, 0];
        for (let y: number = 0; y < 5; y++) {
            for (let x: number = 0; x < 5; x++) {
                if (this.board[y][x] !== SiamPiece.EMPTY) {
                    counts[this.getPieceAtXY(x, y).getOwner().value]++;
                }
            }
        }
        return counts;
    }
}
