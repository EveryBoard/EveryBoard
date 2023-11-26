import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { AbaloneMove } from './AbaloneMove';
import { AbaloneNode } from './AbaloneRules';
import { AbaloneState } from './AbaloneState';
import { MGPMap } from 'src/app/utils/MGPMap';
import { Player } from 'src/app/jscaip/Player';

export class AbaloneScoreHeuristic extends PlayerMetricHeuristic<AbaloneMove, AbaloneState> {

    public getMetrics(node: AbaloneNode): MGPMap<Player, ReadonlyArray<number>> {
        const scores: [number, number] = node.gameState.getScores();
        return new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [scores[0]] },
            { key: Player.ONE, value: [scores[1]] },
        ]);
    }
}
