import { PlayerMetricHeuristic } from '../../jscaip/AI/PlayerMetricHeuristic';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { EmptyRulesConfig } from '../../jscaip/RulesConfigUtil';

import { DiaballikMove } from './DiaballikMove';
import { DiaballikNode } from './DiaballikRules';
import { DiaballikPiece, DiaballikState } from './DiaballikState';

export class DiaballikDistanceHeuristic extends PlayerMetricHeuristic<DiaballikMove, DiaballikState> {

    public override getMetrics(node: DiaballikNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const state: DiaballikState = node.gameState;
        // Inverse of ball distance, i.e., higher if the ball is closest to opponent line
        const ballsCloseness: PlayerNumberTable = new PlayerNumberTable();
        for (const coordAndContent of state.getCoordsAndContents()) {
            const piece: DiaballikPiece = coordAndContent.content;
            if (piece.holdsBall) {
                if (piece.owner === Player.ZERO) {
                    ballsCloseness.set(Player.ZERO, [state.getHeight() - 1 - coordAndContent.coord.y]);
                } else {
                    ballsCloseness.set(Player.ONE, [coordAndContent.coord.y]);
                }
            }
        }
        return ballsCloseness;
    }
}
