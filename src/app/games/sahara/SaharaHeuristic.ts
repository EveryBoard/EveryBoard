import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { NoConfig } from '../../jscaip/RulesConfigUtil';

import { SaharaMove } from './SaharaMove';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaHeuristic extends PlayerMetricHeuristic<SaharaMove, SaharaState> {

    public override getMetrics(node: SaharaNode, _config: NoConfig): PlayerNumberTable {
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(node.gameState, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(node.gameState, Player.ONE);
        return PlayerNumberTable.of(zeroFreedoms, oneFreedoms);
    }

}
