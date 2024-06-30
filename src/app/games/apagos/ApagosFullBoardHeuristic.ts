import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ApagosMove } from './ApagosMove';
import { ApagosConfig, ApagosNode } from './ApagosRules';
import { ApagosState } from './ApagosState';
import { MGPOptional } from '@everyboard/lib';
import { ApagosSquare } from './ApagosSquare';

export class ApagosFullBoardHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState, ApagosConfig> {

    public override getMetrics(node: ApagosNode, _config: MGPOptional<ApagosConfig>): PlayerNumberTable {
        const result: PlayerNumberTable = PlayerNumberTable.of(
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        );
        const board: readonly ApagosSquare[] = node.gameState.board;
        const size: number = board.length;
        for (let i: number = 0; i < size; i++) {
            const levelDominant: PlayerOrNone = board[size - 1 - i].getDominatingPlayer();
            if (levelDominant.isPlayer()) {
                result.add(levelDominant, i, 1);
            }
        }
        return result;
    }

}
