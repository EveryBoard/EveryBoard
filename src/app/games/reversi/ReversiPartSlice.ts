import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {Coord} from '../../jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';

export class ReversiPartSlice extends GamePartSlice {

    public static readonly BOARD_WIDTH = 8;

    public static readonly BOARD_HEIGHT = 8; // default

    public static getStartingBoard(): number[][] {
        const board: number[][] = GamePartSlice.createBiArray(ReversiPartSlice.BOARD_WIDTH,
                                                              ReversiPartSlice.BOARD_HEIGHT,
                                                              Player.NONE.value);
        board[3][3] = Player.ZERO.value;
        board[4][4] = Player.ZERO.value;
        board[3][4] = Player.ONE.value;
        board[4][3] = Player.ONE.value;
        /*board[0][0] = Player.ZERO.value;
        board[0][1] = Player.ONE.value;
        board[7][0] = Player.ZERO.value;
        board[7][1] = Player.ONE.value;*/ // to test "must pass"

        return board;
    }
    public static getNeighbooringPawnLike(board: number[][], searchedValue: number, cx: number, cy: number): Coord[] {
        let c: Coord;
        const result: Coord[] = [];
        for (let ny = -1; ny < 2; ny++) {
            for (let nx = -1; nx < 2; nx++) {
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
        let scores: number[] = [0, 0];
        for (let y = 0; y < ReversiPartSlice.BOARD_HEIGHT; y++) {
            for (let x = 0; x < ReversiPartSlice.BOARD_WIDTH; x++) {
                const caseOwner: number = this.board[y][x];
                if (caseOwner !== Player.NONE.value) {
                    scores[caseOwner] += 1;
                }
            }
        }
		return scores;
	}
}