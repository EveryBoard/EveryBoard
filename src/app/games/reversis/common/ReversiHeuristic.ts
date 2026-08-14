import { PlayerMetricHeuristic } from '../../../jscaip/AI/Minimax';
import { Coord } from '../../../jscaip/Coord';
import { Player } from '../../../jscaip/Player';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';

import { ReversiConfig, ReversiNode } from './AbstractReversiRules';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';

export class ReversiHeuristic extends PlayerMetricHeuristic<ReversiMove, ReversiState, ReversiConfig> {

    public override getMetrics(node: ReversiNode, _config: ReversiConfig): PlayerNumberTable {
        const state: ReversiState = node.gameState;
        const metrics: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        for (const coordAndContent of state.getPlayerCoordsAndContent()) {
            const coord: Coord = coordAndContent.coord;
            const player: Player = coordAndContent.content;
            const verticalBorder: boolean = state.isVerticalEdge(coord);
            const horizontalBorder: boolean = state.isHorizontalEdge(coord);
            const locationValue: number = (verticalBorder ? 4 : 1) * (horizontalBorder ? 4 : 1);
            metrics.add(player, 0, locationValue);
        }
        return metrics;
    }

}
