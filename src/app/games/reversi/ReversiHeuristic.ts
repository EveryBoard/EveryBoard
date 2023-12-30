import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic, PlayerNumberTable } from 'src/app/jscaip/AI/Minimax';
import { ReversiConfig, ReversiNode } from './ReversiRules';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class ReversiHeuristic extends PlayerMetricHeuristic<ReversiMove, ReversiState, ReversiConfig> {

    public getMetrics(node: ReversiNode, optionalConfig: MGPOptional<ReversiConfig>): PlayerNumberTable { // TODO
        const state: ReversiState = node.gameState;
        const config: ReversiConfig = optionalConfig.get();
        const metrics: PlayerNumberTable = PlayerNumberTable.of([0], [0]);
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const content: PlayerOrNone = coordAndContent.content;
            const verticalBorder: boolean = (coord.x === 0) || (coord.x === config.width - 1); // TODO: state.isVerticalBorder
            const horizontalBorder: boolean = (coord.y === 0) || (coord.y === config.height - 1);
            const locationValue: number = (verticalBorder ? 4 : 1) * (horizontalBorder ? 4 : 1);
            if (content.isPlayer()) {
                metrics.add(content, 0, locationValue);
            }
        }
        return metrics;
    }

}
