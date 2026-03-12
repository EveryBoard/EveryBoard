import { PlayerMetricHeuristic } from '../../jscaip/AI/Minimax';
import { Player } from '../../jscaip/Player';
import { PlayerNumberTable } from '../../jscaip/PlayerNumberTable';
import { NoConfig } from '../../jscaip/RulesConfigUtil';

import { SaharaMove } from './SaharaMove';
import { SaharaNode, SaharaRules } from './SaharaRules';
import { SaharaState } from './SaharaState';

export class SaharaHeuristic extends PlayerMetricHeuristic<SaharaMove, SaharaState> {

    public override getMetrics(node: SaharaNode, _config: NoConfig): PlayerNumberTable {
        // TODO: ajouter la métrique "is surrounded", quand une pièce, même en bougeant autant qu'elle veut, ne peux que atteindre des cases ennemis
        // en gros, si cette pièce était morte elle serait considérée comme étant en territoire ennemi
        // Cette métrique devrais prendre en compte que si "je forme un terrritoire" avec une autre pièce, je suis invincible
        const zeroFreedoms: number[] = SaharaRules.getBoardValuesFor(node.gameState, Player.ZERO);
        const oneFreedoms: number[] = SaharaRules.getBoardValuesFor(node.gameState, Player.ONE);
        return PlayerNumberTable.of(zeroFreedoms, oneFreedoms);
    }

}
