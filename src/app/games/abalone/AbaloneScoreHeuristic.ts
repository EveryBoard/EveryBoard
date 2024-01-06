import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { AbaloneMove } from './AbaloneMove';
import { AbaloneNode } from './AbaloneRules';
import { AbaloneState } from './AbaloneState';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class AbaloneScoreHeuristic extends PlayerMetricHeuristic<AbaloneMove, AbaloneState> {

    public override getMetrics(node: AbaloneNode, _config: NoConfig): PlayerNumberTable {
        const scores: [number, number] = node.gameState.getScores();
        return PlayerNumberTable.of(
            [scores[0]],
            [scores[1]],
        );
    }
}
