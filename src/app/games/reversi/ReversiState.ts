import { GameStateWithTable } from '../../jscaip/GameStateWithTable';
import { Coord } from '../../jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class ReversiState extends GameStateWithTable<PlayerOrNone> {

    public static readonly BOARD_WIDTH: number = 8;

    public static readonly BOARD_HEIGHT: number = 8; // default

    public static getInitialState(): ReversiState {
        const board: PlayerOrNone[][] = ArrayUtils.createTable(ReversiState.BOARD_WIDTH,
                                                               ReversiState.BOARD_HEIGHT,
                                                               PlayerOrNone.NONE);
        board[3][3] = Player.ZERO;
        board[4][4] = Player.ZERO;
        board[3][4] = Player.ONE;
        board[4][3] = Player.ONE;
        return new ReversiState(board, 0);
    }
    public static getNeighbooringPawnLike(board: PlayerOrNone[][],
                                          searchedValue: Player,
                                          cx: number,
                                          cy: number)
    : Coord[]
    {
        let coord: Coord;
        const result: Coord[] = [];
        for (let ny: number = -1; ny < 2; ny++) {
            for (let nx: number = -1; nx < 2; nx++) {
                coord = new Coord(cx + nx, cy + ny);
                if (coord.isInRange(this.BOARD_WIDTH, this.BOARD_HEIGHT)) {
                    if (board[coord.y][coord.x] === searchedValue) {
                        result.push(coord);
                    }
                }
            }
        }
        return result;
    }
    public countScore(): [number, number] {
        const scores: [number, number] = [0, 0];
        for (let y: number = 0; y < ReversiState.BOARD_HEIGHT; y++) {
            for (let x: number = 0; x < ReversiState.BOARD_WIDTH; x++) {
                const caseOwner: PlayerOrNone = this.board[y][x];
                if (caseOwner.isPlayer()) {
                    scores[caseOwner.value] += 1;
                }
            }
        }
        return scores;
    }
}
