import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ApagosMove } from './ApagosMove';
import { ApagosNode } from './ApagosRules';
import { ApagosState } from './ApagosState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class ApagosInclusiveHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState> {

    public override getMetrics(node: ApagosNode, _config: NoConfig): PlayerNumberTable {
        const result: PlayerNumberTable = PlayerNumberTable.of(
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        );
        for (let i: number = 0; i < 4; i++) {
            const levelDominant: PlayerOrNone = node.gameState.board[3 - i].getDominatingPlayer();
            if (levelDominant.isPlayer()) {
                result.add(levelDominant, i, 1);
            }
        }
        return result;
    }

}
