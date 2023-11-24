import { DummyHeuristic, Minimax } from 'src/app/jscaip/AI/Minimax';
import { NewGameMoveGenerator } from './NewGameMoveGenerator';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { NewGameLegalityInfo, NewGameRules } from './NewGameRules';

/**
 * This is the minimax AI.
 * You can plug in the heuristic and move generator.
 */
export class NewGameMinimax extends Minimax<NewGameMove, NewGameState, NewGameLegalityInfo> {

    public constructor() {
        super('Dummy', NewGameRules.get(), new DummyHeuristic(), new NewGameMoveGenerator());
    }
}
