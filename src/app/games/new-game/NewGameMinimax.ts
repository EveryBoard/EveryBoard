import { Minimax } from 'src/app/jscaip/AI/Minimax';
import { NewGameMoveGenerator } from './NewGameMoveGenerator';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { NewGameLegalityInfo, NewGameRules } from './NewGameRules';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { NewGameHeuristic } from './NewGameHeuristic';

/**
 * This is the minimax AI.
 * You can plug in the heuristic and move generator.
 */
export class NewGameMinimax extends Minimax<NewGameMove, NewGameState, EmptyRulesConfig, NewGameLegalityInfo> {

    public constructor() {
        super('Dummy',
              NewGameRules.get(),
              new NewGameHeuristic(), // Or "new DummyHeuristic()" if you did not create NewGameHeuristic
              new NewGameMoveGenerator(),
        );
    }
}
