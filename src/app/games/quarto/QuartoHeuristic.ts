import { QuartoState } from './QuartoState';
import { QuartoMove } from './QuartoMove';
import { SCORE } from 'src/app/jscaip/SCORE';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { QuartoNode, BoardStatus, QuartoRules, Score } from './QuartoRules';
import { Player } from 'src/app/jscaip/Player';
import { Utils } from '@everyboard/lib';
import { CoordSet } from 'src/app/jscaip/CoordSet';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class QuartoHeuristic extends Heuristic<QuartoMove, QuartoState> {

    private scoreToBoardValue(score: Score, turn: number): BoardValue {
        if (score === 'Nothing') {
            return BoardValue.of(0);
        } else {
            Utils.assert(score === 'PreVictory', 'QuartoHeuristic score can only be pre-victory or default');
            const player: Player = Player.of(turn % 2);
            return BoardValue.of(player.getPreVictory());
        }
    }

    public getBoardValue(node: QuartoNode, _config: NoConfig): BoardValue {
        const state: QuartoState = node.gameState;
        let boardStatus: BoardStatus = {
            score: 'Nothing',
            sensitiveSquares: new CoordSet(),
        };
        for (const line of QuartoRules.get().lines) {
            boardStatus = QuartoRules.get().updateBoardStatus(line, state, boardStatus);
        }
        return this.scoreToBoardValue(boardStatus.score, state.turn);
    }

}
