import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { SCORE } from 'src/app/jscaip/SCORE';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { QuartoNode, BoardStatus, QuartoRules } from './QuartoRules';
import { Player } from 'src/app/jscaip/Player';
import { Utils } from '@everyboard/lib';
import { ImmutableCoordSet } from 'src/app/jscaip/CoordSet';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class QuartoHeuristic extends Heuristic<QuartoMove, QuartoState> {

    private scoreToBoardValue(score: SCORE, turn: number): BoardValue {
        if (score === SCORE.DEFAULT) {
            return BoardValue.of(0);
        } else {
            Utils.assert(score === SCORE.PRE_VICTORY, 'QuartoHeuristic score can only be pre-victory or default');
            const player: Player = Player.of(turn % 2);
            return BoardValue.of(player.getPreVictory());
        }
    }

    public getBoardValue(node: QuartoNode, _config: NoConfig): BoardValue {
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            score: SCORE.DEFAULT,
            sensitiveSquares: new ImmutableCoordSet(),
        };
        for (const line of QuartoRules.lines) {
            boardStatus = QuartoRules.updateBoardStatus(line, state, boardStatus);
        }
        return this.scoreToBoardValue(boardStatus.score, state.turn);
    }

}
