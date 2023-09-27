import { Minimax } from 'src/app/jscaip/Minimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasLegalityInformation, EpaminondasRules } from './EpaminondasRules';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from './EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasHeuristic } from './EpaminondasHeuristic';

export class EpaminondasMinimax extends Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation> {

    public constructor() {
        super($localize`Minimax`,
              EpaminondasRules.get(),
              new EpaminondasHeuristic(),
              new EpaminondasPhalanxSizeAndFilterMoveGenerator());
    }
}
