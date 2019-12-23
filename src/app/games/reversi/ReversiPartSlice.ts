import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {Coord} from '../../jscaip/Coord';

export class ReversiPartSlice extends GamePartSlice {
    static readonly PLAYER_ZERO = 0;
    static readonly PLAYER_ONE = 1;
    static readonly UNOCCUPIED = 2;
    static readonly BOARD_WIDTH = 8;
    static readonly BOARD_HEIGHT = 8; // default

    protected readonly board: number[][];

    readonly turn: number;

    static getStartingBoard(): number[][] {
        const board: number[][] = GamePartSlice.createBiArray(8, 8, this.UNOCCUPIED);
        /*board[3][3] = this.PLAYER_ZERO;
        board[4][4] = this.PLAYER_ZERO;
        board[3][4] = this.PLAYER_ONE;
        board[4][3] = this.PLAYER_ONE;*/
        board[0][0] = this.PLAYER_ZERO;
        board[0][1] = this.PLAYER_ONE;
        board[7][0] = this.PLAYER_ZERO;
        board[7][1] = this.PLAYER_ONE;

        return board;
    }

    static getNeighbooringPawnLike(board: number[][], searchedValue: number, cx: number, cy: number): Coord[] {
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
}