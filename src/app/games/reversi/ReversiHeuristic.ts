import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { Player } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { PlayerNumberTable } from 'src/app/jscaip/PlayerNumberTable';
import { ReversiConfig, ReversiNode } from './ReversiRules';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from '@everyboard/lib';

export class ReversiHeuristic extends PlayerMetricHeuristic<ReversiMove, ReversiState, ReversiConfig> {

    public override getMetrics(node: ReversiNode, _config: MGPOptional<ReversiConfig>): PlayerNumberTable {
        const state: ReversiState = node.gameState;
        const metrics: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        for (const coordAndContent of state.getPlayerCoordsAndContent()) {
            const coord: Coord = coordAndContent.coord;
            const content: Player = coordAndContent.content;
            const verticalBorder: boolean = state.isVerticalEdge(coord);
            const horizontalBorder: boolean = state.isHorizontalEdge(coord);
            const locationValue: number = (verticalBorder ? 4 : 1) * (horizontalBorder ? 4 : 1);
            metrics.add(content, 0, locationValue);
        }
        return metrics;
    }

}
