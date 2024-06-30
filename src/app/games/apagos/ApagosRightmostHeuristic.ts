import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ApagosMove } from './ApagosMove';
import { ApagosConfig, ApagosNode } from './ApagosRules';
import { ApagosState } from './ApagosState';
import { MGPOptional } from '@everyboard/lib';
import { ApagosSquare } from './ApagosSquare';

export class ApagosRightmostHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState, ApagosConfig> {

    public override getMetrics(node: ApagosNode, _config: MGPOptional<ApagosConfig>): PlayerNumberTable {
        const board: readonly ApagosSquare[] = node.gameState.board;
        const size: number = board.length;
        const levelThreeDominant: PlayerOrNone = board[size - 1].getDominatingPlayer();
        const result: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        if (levelThreeDominant.isPlayer()) {
            result.add(levelThreeDominant, 0, 1);
        }
        return result;
    }

}
