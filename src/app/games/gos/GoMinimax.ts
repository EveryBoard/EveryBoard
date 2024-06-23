import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { GoMove } from './GoMove';
import { GoMoveGenerator } from './GoMoveGenerator';
import { GoConfig, GoRules } from './go/GoRules'; // TODO: chacun sa sienne ouuu ?
import { GoHeuristic } from './GoHeuristic';
import { GoState } from './GoState';
import { GoLegalityInformation } from './AbstractGoRules';

export class GoMinimax extends Minimax<GoMove, GoState, GoConfig, GoLegalityInformation> {

    public constructor() {
        super($localize`Minimax`,
              GoRules.get(),
              new GoHeuristic(),
              new GoMoveGenerator());
    }

}
