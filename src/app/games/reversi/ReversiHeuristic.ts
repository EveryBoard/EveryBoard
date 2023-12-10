import { ReversiState } from './ReversiState';
import { ReversiMove } from './ReversiMove';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { ReversiConfig, ReversiNode } from './ReversiRules';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class ReversiHeuristic extends PlayerMetricHeuristic<ReversiMove, ReversiState, ReversiConfig> {

    public getMetrics(node: ReversiNode, optionalConfig: MGPOptional<ReversiConfig>)
    : MGPMap<Player, ReadonlyArray<number>>
    {
        const state: ReversiState = node.gameState;
        const config: ReversiConfig = optionalConfig.get();
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
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [player0Count] },
            { key: Player.ONE, value: [player1Count] },
        ]);
    }

}
