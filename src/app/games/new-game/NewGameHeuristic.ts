import { BoardValue } from 'src/app/jscaip/AI/BoardValue';
import { Heuristic } from 'src/app/jscaip/AI/Minimax';
import { NewGameMove } from './NewGameMove';
import { NewGameConfig, NewGameNode } from './NewGameRules';
import { NewGameState } from './NewGameState';
import { MGPOptional } from 'src/app/utils/MGPOptional';

// A heuristic assigns values to game states
export class NewGameHeuristic extends Heuristic<NewGameMove, NewGameState, BoardValue, NewGameConfig> {
    /**
     * This function assigns a score to a state, in the form of a `BoardValue`.
     * Most of the time, you want to use `BoardValue` directly. It is simply a number wrapper.
     * The meaning of this score is:
     *   - a score of 0: no player has the advantage
     *   - a positive score: Player.ONE has the advantage
     *   - a negative score: Player.ZERO has the advantage
     * You should not handle victories here, this is handled by the rules' getGameStatus method.
     *
     * You may want to use `PlayerMetricHeuristic` to define a score for each player instead, which
     * is often what you want.
     */
    public getBoardValue(node: NewGameNode, _config: MGPOptional<NewGameConfig>): BoardValue {
        return BoardValue.of(node.gameState.turn);
    }

}
