import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { GoMove } from './GoMove';
import { AbstractGoMoveGenerator } from './AbstractGoMoveGenerator';
import { GoState } from './GoState';
import { AbstractGoRules, GoLegalityInformation } from './AbstractGoRules';
import { AbstractGoHeuristic } from './AbstractGoHeuristic';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';

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
