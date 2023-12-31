import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { DiaballikNode } from './DiaballikRules';
import { DiaballikMove } from './DiaballikMove';
import { DiaballikPiece, DiaballikState } from './DiaballikState';
import { Player } from 'src/app/jscaip/Player';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class DiaballikDistanceHeuristic extends PlayerMetricHeuristic<DiaballikMove, DiaballikState> {

    public override getMetrics(node: DiaballikNode, _config: NoConfig): PlayerNumberTable {
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
