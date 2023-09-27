import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { SCORE } from 'src/app/jscaip/SCORE';
import { Heuristic } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { QuartoNode, BoardStatus, QuartoRules } from './QuartoRules';
import { Player } from 'src/app/jscaip/Player';
import { CoordSet } from 'src/app/utils/OptimizedSet';
import { Utils } from 'src/app/utils/utils';

export class QuartoHeuristic extends Heuristic<QuartoMove, QuartoState> {

    private scoreToBoardValue(score: SCORE, turn: number): BoardValue {
        if (score === SCORE.DEFAULT) {
            return new BoardValue(0);
        } else {
            Utils.assert(score === SCORE.PRE_VICTORY, 'QuartoHeuristic score can only be pre-victory or default');
            const player: Player = Player.of(turn % 2);
            return new BoardValue(player.getPreVictory());
        }
    }
    public getBoardValue(node: QuartoNode): BoardValue {
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            score: SCORE.DEFAULT,
            sensitiveSquares: new CoordSet(),
        };
        for (const line of QuartoRules.lines) {
            boardStatus = QuartoRules.updateBoardStatus(line, state, boardStatus);
        }
        return this.scoreToBoardValue(boardStatus.score, state.turn);
    }
}
