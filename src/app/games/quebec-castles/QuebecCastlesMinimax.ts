import { DummyHeuristic, Minimax } from '../../jscaip/AI/Minimax';
import { QuebecCastlesMoveGenerator } from './QuebecCastlesMoveGenerator';
import { QuebecCastlesMove } from './QuebecCastlesMove';
import { QuebecCastlesState } from './QuebecCastlesState';
import { QuebecCastlesConfig, QuebecCastlesRules } from './QuebecCastlesRules';

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
