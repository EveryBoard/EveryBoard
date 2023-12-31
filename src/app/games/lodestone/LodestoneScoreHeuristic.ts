import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { LodestoneMove } from './LodestoneMove';
import { LodestoneNode } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class LodestoneScoreHeuristic extends PlayerMetricHeuristic<LodestoneMove, LodestoneState> {

    public override getMetrics(node: LodestoneNode, _config: NoConfig): PlayerNumberTable {
        const scores: [number, number] = node.gameState.getScores();
        return PlayerNumberTable.of(
            [scores[0]],
            [scores[1]],
        );
    }

}
