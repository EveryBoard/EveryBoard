import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { ReversiNode } from './ReversiRules';

export class ReversiHeuristic extends PlayerMetricHeuristic<ReversiMove, ReversiState> {

    public getMetrics(node: ReversiNode): [number, number] {
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
        return [player0Count, player1Count];
    }
}
