import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { NewGameLegalityInfo, NewGameNode, NewGameRules } from './NewGameRules';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { BoardValue } from 'src/app/jscaip/BoardValue';


// A move generator lists possible moves for a game
export class NewGameMoveGenerator extends MoveGenerator<NewGameMove, NewGameState> {

    /**
     * This method lists all useful moves to consider in the move exploration.
     * In general, you can list all possible moves.
     * It is however an option to exclude some move of the list if:
     *     - they have no way to be needed in any interesting part
     *     - the can only lead to avoidable defeat
     */
    public getListMoves(node: NewGameNode): NewGameMove[] {
        return [];
    }
}

// A heuristic assigns values to game states
export class NewGameHeuristic extends Heuristic<NewGameMove, NewGameState> {
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
    public getBoardValue(node: NewGameNode): BoardValue {
        return new BoardValue(0);
    }
}

/**
 * A minimax uses a move generator and a heuristic.
 *
 * By convention, we call such a class a "dummy minimax" if:
 *   - it doesn't filter any move in `getListMoves`
 *   - it has a simplistic `getBoardValue`, only relying the score stored in the state
 * TODO FOR REVIEW: je propose "dummy minimax" = minimux avec DummyHeuristic (prédéfinie à 0 par plateau)
 * TODO FOR REVIEW: vs. "score minimax" = minimax qui utilise le score comme heuristique
 */
export class NewGameDummyMinimax extends Minimax<NewGameMove, NewGameState, NewGameLegalityInfo> {

    public constructor() {
        super('Dummy Minimax', NewGameRules.get(), new NewGameHeuristic(), new NewGameMoveGenerator());
    }
}
