import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { ReversiConfig, ReversiNode } from './ReversiRules';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class ReversiHeuristic extends PlayerMetricHeuristic<ReversiMove, ReversiState, ReversiConfig> {

    public override getMetrics(node: ReversiNode, _config: MGPOptional<ReversiConfig>): PlayerNumberTable {
        const state: ReversiState = node.gameState;
        const metrics: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const content: PlayerOrNone = coordAndContent.content;
            const verticalBorder: boolean = state.isVerticalEdge(coord);
            const horizontalBorder: boolean = state.isHorizontalEdge(coord);
            const locationValue: number = (verticalBorder ? 4 : 1) * (horizontalBorder ? 4 : 1);
            if (content.isPlayer()) {
                metrics.add(content, 0, locationValue);
            }
        }
        return metrics;
    }

}
