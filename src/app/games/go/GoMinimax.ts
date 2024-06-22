import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { GoMove } from './GoMove';
import { GoMoveGenerator } from './GoMoveGenerator';
import { GoConfig, GoLegalityInformation, GoRules } from './GoRules';
import { GoHeuristic } from './GoHeuristic';
import { GoState } from './GoState';

export class GoMinimax extends Minimax<GoMove, GoState, GoConfig, GoLegalityInformation> {

    public constructor() {
        super($localize`Minimax`,
              GoRules.get(),
              new GoHeuristic(),
              new GoMoveGenerator());
    }

}
