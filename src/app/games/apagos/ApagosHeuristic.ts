import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ApagosMove } from './ApagosMove';
import { ApagosNode } from './ApagosRules';
import { ApagosState } from './ApagosState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class ApagosHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState> {

    public override getMetrics(node: ApagosNode, _config: NoConfig): PlayerNumberTable {
        const levelThreeDominant: PlayerOrNone = node.gameState.board[3].getDominatingPlayer();
        const result: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        if (levelThreeDominant.isPlayer()) {
            result.add(levelThreeDominant, 0, 1);
        }
        return result;
    }

}
