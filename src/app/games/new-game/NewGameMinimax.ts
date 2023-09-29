import { DummyHeuristic, Minimax } from 'src/app/jscaip/Minimax';
import { NewGameMoveGenerator } from './NewGameMoveGenerator';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { NewGameLegalityInfo, NewGameRules } from './NewGameRules';
import { NewRulesConfig } from './NewRulesConfig';

/**
 * This is the minimax AI.
 * You can plug in the heuristic and move generator.
 */
export class NewGameMinimax extends Minimax<NewGameMove, NewGameState, NewRulesConfig, NewGameLegalityInfo> {

    public constructor() {
        super('Dummy', NewGameRules.get(), new DummyHeuristic(), new NewGameMoveGenerator());
    }
}
