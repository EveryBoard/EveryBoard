import { DummyHeuristic, Minimax } from '../../jscaip/AI/Minimax';

import { QuebecCastlesMove } from './QuebecCastlesMove';
import { QuebecCastlesMoveGenerator } from './QuebecCastlesMoveGenerator';
import { QuebecCastlesConfig, QuebecCastlesRules } from './QuebecCastlesRules';
import { QuebecCastlesState } from './QuebecCastlesState';

/**
 * This is the minimax AI.
 * You can plug in the heuristic and move generator.
 */
export class QuebecCastlesMinimax extends Minimax<QuebecCastlesMove, QuebecCastlesState, QuebecCastlesConfig> {

    public constructor() {
        super('Dummy',
              QuebecCastlesRules.get(),
              new DummyHeuristic(),
              new QuebecCastlesMoveGenerator(),
        );
        this.random = true;
    }
}
