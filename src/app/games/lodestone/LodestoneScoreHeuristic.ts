import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { LodestoneMove } from './LodestoneMove';
import { LodestoneNode } from './LodestoneRules';
import { LodestoneState } from './LodestoneState';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';

export class LodestoneScoreHeuristic extends PlayerMetricHeuristic<LodestoneMove, LodestoneState> {

    public getMetrics(node: LodestoneNode): MGPMap<Player, ReadonlyArray<number>> {
        const scores: [number, number] = node.gameState.getScores();
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [scores[0]] },
            { key: Player.ONE, value: [scores[1]] },
        ]);
    }

}
