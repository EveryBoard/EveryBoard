import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { ReversiRules, ReversiNode, ReversiMoveWithSwitched, ReversiLegalityInformation } from './ReversiRules';
import { Coord } from 'src/app/jscaip/Coord';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { GameStatus } from 'src/app/jscaip/Rules';

export class ReversiMinimax extends Minimax<ReversiMove, ReversiState, ReversiLegalityInformation> {

    public static readonly bestCoords: Coord[] = [
        new Coord(0, 0),
        new Coord(0, ReversiState.BOARD_HEIGHT - 1),
        new Coord(ReversiState.BOARD_WIDTH - 1, 0),
        new Coord(ReversiState.BOARD_WIDTH - 1, ReversiState.BOARD_HEIGHT - 1),
    ];
    public getBoardValue(node: ReversiNode): BoardValue {
        const gameStatus: GameStatus = ReversiRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return BoardValue.fromWinner(gameStatus.winner);
        }
        const state: ReversiState = node.gameState;
        const board: PlayerOrNone[][] = state.getCopiedBoard();
        let player0Count: number = 0;
        let player1Count: number = 0;
        for (let y: number = 0; y < ReversiState.BOARD_HEIGHT; y++) {
            for (let x: number = 0; x < ReversiState.BOARD_WIDTH; x++) {
                const verticalBorder: boolean = (x === 0) || (x === ReversiState.BOARD_WIDTH - 1);
                const horizontalBorder: boolean = (y === 0) || (y === ReversiState.BOARD_HEIGHT - 1);
                const locationValue: number = (verticalBorder ? 4 : 1) * (horizontalBorder ? 4 : 1);

                if (board[y][x] === Player.ZERO) {
                    player0Count += locationValue;
                }
                if (board[y][x] === Player.ONE) {
                    player1Count += locationValue;
                }
            }
        }
        player0Count *= Player.ZERO.getScoreModifier();
        player1Count *= Player.ONE.getScoreModifier();
        return new BoardValue(player1Count + player0Count);
    }
    public getListMoves(n: ReversiNode): ReversiMove[] {
        const moves: ReversiMoveWithSwitched[] = ReversiRules.getListMoves(n.gameState);
        // Best moves are on the corner, otherwise moves are sorted by number of pieces switched
        ArrayUtils.sortByDescending(moves, (moveWithSwitched: ReversiMoveWithSwitched): number => {
            if (ReversiMinimax.bestCoords.some((coord: Coord): boolean => moveWithSwitched.move.coord.equals(coord))) {
                return 100;
            } else {
                return moveWithSwitched.switched;
            }
        });
        return moves.map((moveWithSwitched: ReversiMoveWithSwitched): ReversiMove => {
            return moveWithSwitched.move;
        });
    }
}
