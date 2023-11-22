import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/Minimax';
import { ReversiConfig, ReversiNode } from './ReversiRules';
import { Coord } from 'src/app/jscaip/Coord';

export class ReversiHeuristic extends PlayerMetricHeuristic<ReversiMove, ReversiState, ReversiConfig> {

    public getMetrics(node: ReversiNode): [number, number] {
        const state: ReversiState = node.gameState;
        const config: ReversiConfig = node.getConfig();
        let player0Count: number = 0;
        let player1Count: number = 0;
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const content: PlayerOrNone = coordAndContent.content;
            const verticalBorder: boolean = (coord.x === 0) || (coord.x === config.width - 1);
            const horizontalBorder: boolean = (coord.y === 0) || (coord.y === config.height - 1);
            const locationValue: number = (verticalBorder ? 4 : 1) * (horizontalBorder ? 4 : 1);
            if (content === Player.ZERO) {
                player0Count += locationValue;
            } else if (content === Player.ONE) {
                player1Count += locationValue;
            }
        }
        return [player0Count, player1Count];
    }

}
