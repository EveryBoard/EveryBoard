import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasLegalityInformation, EpaminondasRules } from './EpaminondasRules';
import { EpaminondasAttackHeuristic } from './EpaminondasAttackHeuristic';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from './EpaminondasPhalanxSizeAndFilterMoveGenerator';

export class EpaminondasAttackMinimax
    extends Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation>
{

    public constructor() {
        super($localize`Attack`,
              EpaminondasRules.get(),
              new EpaminondasAttackHeuristic(),
              new EpaminondasPhalanxSizeAndFilterMoveGenerator(),
        );
    }
}
