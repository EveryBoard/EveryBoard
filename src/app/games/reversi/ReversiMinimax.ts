import { ReversiPartSlice } from './ReversiPartSlice';
import { ReversiMove } from './ReversiMove';
import { ReversiLegalityStatus } from './ReversiLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { ReversiRules, ReversiNode } from './ReversiRules';


export class ReversiMinimax extends Minimax<ReversiMove, ReversiPartSlice, ReversiLegalityStatus> {

    public getBoardValue(node: ReversiNode): NodeUnheritance {
        const slice: ReversiPartSlice = node.gamePartSlice;
        const gameIsEnded: boolean = ReversiRules.isGameEnded(slice);
        const board: number[][] = slice.getCopiedBoard();
        let player0Count: number = 0;
        let player1Count: number = 0;
        for (let y: number = 0; y < ReversiPartSlice.BOARD_HEIGHT; y++) {
            for (let x: number = 0; x < ReversiPartSlice.BOARD_WIDTH; x++) {
                let locationValue: number;
                if (gameIsEnded) {
                    locationValue = 1;
                } else {
                    const verticalBorder: boolean = (x === 0) || (x === ReversiPartSlice.BOARD_WIDTH - 1);
                    const horizontalBorder: boolean = (y === 0) || (y === ReversiPartSlice.BOARD_HEIGHT - 1);
                    locationValue = (verticalBorder ? 4 : 1) * (horizontalBorder ? 4 : 1);
                }

                if (board[y][x] === Player.ZERO.value) {
                    player0Count += locationValue;
                }
                if (board[y][x] === Player.ONE.value) {
                    player1Count += locationValue;
                }
            }
        }
        const diff: number = player1Count - player0Count;
        if (gameIsEnded) {
            if (diff < 0) {
                return new NodeUnheritance(Player.ZERO.getVictoryValue());
            }
            if (diff > 0) {
                return new NodeUnheritance(Player.ONE.getVictoryValue());
            }
            // else : equality
        }
        return new NodeUnheritance(diff);
    }
    public getListMoves(n: ReversiNode): ReversiMove[] {
        return ReversiRules.getListMoves(n.gamePartSlice);
    }
}
