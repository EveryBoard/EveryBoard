import { PlayerMetricHeuristic } from '../../../jscaip/AI/Minimax';
import { Coord } from '../../../jscaip/Coord';
import { Player, PlayerOrNone } from '../../../jscaip/Player';
import { PlayerNumberTable } from '../../../jscaip/PlayerNumberTable';

import { ReversiConfig, ReversiNode, TopologicReversiRules } from './AbstractReversiRules';
import { ReversiMove } from './ReversiMove';
import { ReversiState } from './ReversiState';


export class ReversiHeuristic extends PlayerMetricHeuristic<ReversiMove, ReversiState, ReversiConfig> {

    public constructor(
        public readonly rules: TopologicReversiRules,
    ) {
        super();
    }

    public override getMetrics(node: ReversiNode, _config: ReversiConfig): PlayerNumberTable {
        const state: ReversiState = node.gameState;
        const metrics: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        for (const coordAndContent of state.getCoordsAndContents()) {
            const content: PlayerOrNone = coordAndContent.content.getPlayer();
            if (content instanceof Player) {
                const coord: Coord = coordAndContent.coord;
                const unsandwichableDirections: number =
                    this.rules.countUnsandwichableDirections(state, coord);
                const locationValue: number = 2 ** unsandwichableDirections;
                metrics.add(content, 0, locationValue);
            }
        }
        return metrics;
    }

}
