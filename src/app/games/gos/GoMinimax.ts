import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { GoMove } from './GoMove';
import { GoMoveGenerator } from './GoMoveGenerator';
import { GoConfig } from './go/GoRules';
import { GoHeuristic } from './GoHeuristic';
import { GoState } from './GoState';
import { AbstractGoRules, GoLegalityInformation } from './AbstractGoRules';
import { TriGoConfig } from './tri-go/TriGoRules';

export class GoMinimax<C extends GoConfig | TriGoConfig> extends Minimax<GoMove, GoState, C, GoLegalityInformation> {

    public constructor(rules: AbstractGoRules<C>) {
        super($localize`Minimax`,
              rules,
              new GoHeuristic(rules),
              new GoMoveGenerator(rules));
    }

}
