import { Minimax } from '../../jscaip/AI/Minimax';

import { AbstractGoHeuristic } from './AbstractGoHeuristic';
import { AbstractGoMoveGenerator } from './AbstractGoMoveGenerator';
import { AbstractGoConfig, AbstractGoRules, GoLegalityInformation } from './AbstractGoRules';
import { GoMove } from './GoMove';
import { GoState } from './GoState';

export abstract class AbstractGoMinimax<C extends AbstractGoConfig>
    extends Minimax<GoMove, GoState, C, GoLegalityInformation>
{

    public constructor(rules: AbstractGoRules<C>,
                       moveGenerator: AbstractGoMoveGenerator<C>,
                       heuristic: AbstractGoHeuristic<C>)
    {
        super($localize`Minimax`,
              rules,
              heuristic,
              moveGenerator);
    }

}
