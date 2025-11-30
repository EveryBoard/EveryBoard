import { Minimax } from '../../jscaip/AI/Minimax';
import { GoMove } from './GoMove';
import { AbstractGoMoveGenerator } from './AbstractGoMoveGenerator';
import { GoState } from './GoState';
import { AbstractGoRules, GoLegalityInformation } from './AbstractGoRules';
import { AbstractGoHeuristic } from './AbstractGoHeuristic';
import { RulesConfig } from '../../jscaip/RulesConfigUtil';

export abstract class AbstractGoMinimax<C extends RulesConfig>
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
