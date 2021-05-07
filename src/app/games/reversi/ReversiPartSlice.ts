import { GamePartSlice } from '../../jscaip/GamePartSlice';
import { Coord } from '../../jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class ReversiPartSlice extends GamePartSlice {

    public static readonly BOARD_WIDTH: number = 8;

    public static readonly BOARD_HEIGHT: number = 8; // default

    public static getInitialSlice(): ReversiPartSlice {
        const board: number[][] = ArrayUtils.createBiArray(ReversiPartSlice.BOARD_WIDTH,
                                                           ReversiPartSlice.BOARD_HEIGHT,
                                                           Player.NONE.value);
        board[3][3] = Player.ZERO.value;
        board[4][4] = Player.ZERO.value;
        board[3][4] = Player.ONE.value;
        board[4][3] = Player.ONE.value;
        return new ReversiPartSlice(board, 0);
    }
    public static getNeighbooringPawnLike(board: number[][], searchedValue: number, cx: number, cy: number): Coord[] {
        let c: Coord;
        const result: Coord[] = [];
        for (let ny: number = -1; ny < 2; ny++) {
            for (let nx: number = -1; nx < 2; nx++) {
                c = new Coord(cx + nx, cy + ny);
                if (c.isInRange(this.BOARD_WIDTH, this.BOARD_HEIGHT)) {
                    if (board[c.y][c.x] === searchedValue) {
                        result.push(c);
                    }
                }
            }
        }
        return result;
    }
    public countScore(): number[] {
        const scores: number[] = [0, 0];
        for (let y: number = 0; y < ReversiPartSlice.BOARD_HEIGHT; y++) {
            for (let x: number = 0; x < ReversiPartSlice.BOARD_WIDTH; x++) {
                const caseOwner: number = this.board[y][x];
                if (caseOwner !== Player.NONE.value) {
                    scores[caseOwner] += 1;
                }
            }
        }
        return scores;
    }
}
