import { PlayerMetricHeuristic } from 'src/app/jscaip/AI/Minimax';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { ApagosMove } from './ApagosMove';
import { ApagosNode } from './ApagosRules';
import { ApagosState } from './ApagosState';
import { MGPMap } from 'src/app/utils/MGPMap';

export class ApagosHeuristic extends PlayerMetricHeuristic<ApagosMove, ApagosState> {

    public getMetrics(node: ApagosNode): MGPMap<Player, ReadonlyArray<number>> {
        const levelThreeDominant: PlayerOrNone = node.gameState.board[3].getDominatingPlayer();
        const result: MGPMap<Player, ReadonlyArray<number>> = new MGPMap<Player, ReadonlyArray<number>>([
            { key: Player.ZERO, value: [0] },
            { key: Player.ONE, value: [0] },
        ]);
        if (levelThreeDominant.isPlayer()) {
            result.replace(levelThreeDominant, [1]);
        }
        return result;
    }

}
