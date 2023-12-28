import { Minimax } from 'src/app/jscaip/Minimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasConfig, EpaminondasLegalityInformation, EpaminondasRules } from './EpaminondasRules';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from './EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasHeuristic } from './EpaminondasHeuristic';

export class EpaminondasMinimax extends Minimax<EpaminondasMove,
                                                EpaminondasState,
                                                EpaminondasConfig,
                                                EpaminondasLegalityInformation>
{

    public constructor() {
        super($localize`Minimax`,
              EpaminondasRules.get(),
              new EpaminondasHeuristic(),
              new EpaminondasPhalanxSizeAndFilterMoveGenerator());
    }

}
