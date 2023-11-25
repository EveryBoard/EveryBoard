import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasState } from './EpaminondasState';
import { EpaminondasLegalityInformation, EpaminondasRules } from './EpaminondasRules';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from './EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasPositionalHeuristic } from './EpaminondasPositionalHeuristic';

export class EpaminondasPositionalMinimax
    extends Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation>
{

    public constructor() {
        super($localize`Positional`,
              EpaminondasRules.get(),
              new EpaminondasPositionalHeuristic(),
              new EpaminondasPhalanxSizeAndFilterMoveGenerator(),
        );
    }
}
