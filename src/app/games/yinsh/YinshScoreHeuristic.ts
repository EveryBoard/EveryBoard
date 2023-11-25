import { YinshState } from './YinshState';
import { YinshMove } from './YinshMove';
import { YinshNode } from './YinshRules';
import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Player } from 'src/app/jscaip/Player';

export class YinshScoreHeuristic extends PlayerMetricHeuristic<YinshMove, YinshState> {

    public getMetrics(node: YinshNode): MGPMap<Player, ReadonlyArray<number>> {
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [node.gameState.sideRings[0]] }, // TODO there should be no need to do this!
            { key: Player.ONE, value: [node.gameState.sideRings[1]] },
        ]);
    }
}
