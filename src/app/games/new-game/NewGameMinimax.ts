import { DummyHeuristic, Minimax } from 'src/app/jscaip/Minimax';
import { NewGameMoveGenerator } from './NewGameMoveGenerator';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { NewGameConfig, NewGameLegalityInfo, NewGameRules } from './NewGameRules';

/**
 * This is the minimax AI.
 * You can plug in the heuristic and move generator.
 */
export class NewGameMinimax extends Minimax<NewGameMove, NewGameState, NewGameConfig, NewGameLegalityInfo> {

    public constructor() {
        super('Dummy',
              NewGameRules.get(),
              new DummyHeuristic(),
              new NewGameMoveGenerator(),
        );
    }
}
