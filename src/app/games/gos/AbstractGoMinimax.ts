import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { GoMove } from './GoMove';
import { AbstractGoMoveGenerator } from './AbstractGoMoveGenerator';
import { GoConfig } from './go/GoRules';
import { GoHeuristic } from './go/GoHeuristic';
import { GoState } from './GoState';
import { AbstractGoRules, GoLegalityInformation } from './AbstractGoRules';
import { TriGoConfig } from './tri-go/TriGoRules';

export abstract class AbstractGoMinimax<C extends GoConfig | TriGoConfig>
    extends Minimax<GoMove, GoState, C, GoLegalityInformation>
{

    public constructor(rules: AbstractGoRules<C>, moveGenerator: AbstractGoMoveGenerator) {
        super($localize`Minimax`,
              rules,
              new GoHeuristic(),
              moveGenerator);
    }

}
