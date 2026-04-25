import { Minimax } from '../../jscaip/AI/Minimax';

import { EpaminondasAttackHeuristic } from './EpaminondasAttackHeuristic';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from './EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasConfig, EpaminondasLegalityInformation, EpaminondasRules } from './EpaminondasRules';
import { EpaminondasState } from './EpaminondasState';

export class EpaminondasAttackMinimax
    extends Minimax<EpaminondasMove, EpaminondasState, EpaminondasConfig, EpaminondasLegalityInformation>
{

    public constructor() {
        super($localize`Attack`,
              EpaminondasRules.get(),
              new EpaminondasAttackHeuristic(),
              new EpaminondasPhalanxSizeAndFilterMoveGenerator(),
        );
    }
}
