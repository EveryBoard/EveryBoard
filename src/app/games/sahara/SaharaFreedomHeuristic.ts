import { Player } from '@everyboard/games';
import { PlayerMetricHeuristic } from '@everyboard/games';
import { PlayerNumberTable } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';

import { SaharaMove } from './SaharaMove';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaFreedomHeuristic extends PlayerMetricHeuristic<SaharaMove, SaharaState> {

    public override getMetrics(node: SaharaNode, _config: EmptyRulesConfig): PlayerNumberTable {
        const zeroFreedoms: number[] = SaharaRules.get().getBoardValuesFor(node.gameState, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.get().getBoardValuesFor(node.gameState, Player.ONE);
        return PlayerNumberTable.of(zeroFreedoms, oneFreedoms);
    }

}
