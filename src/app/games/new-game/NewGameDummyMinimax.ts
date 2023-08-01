import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { NewGameMove } from './NewGameMove';
import { NewGameState } from './NewGameState';
import { NewGameBoardValue, NewGameLegalityInfo, NewGameNode, NewGameRules } from './NewGameRules';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

// TODO: update documentation

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

export class NewGameHeuristic extends Heuristic<NewGameMove, NewGameState> {
    /**
     * This function assigns a score to a state, in the form of a `BoardValue`.
     * Most of the time, you want to use `BoardValue` directly. It is simply a number wrapper.
     * The meaning of this score is:
     *   - a score of 0: no player has the advantage
     *   - a positive score: Player.ONE has the advantage
     *   - a negative score: Player.ZERO has the advantage
     *   - Number.MAX_SAFE_INTEGER: Player.ONE won
     *   - Number.MIN_SAFE_INTEGER: Player.ZERO won
     *
     * You want want to use `PlayerMetricsMinimax` to define a score for each player instead, which
     * is often what you want.
     */
    public getBoardValue(node: NewGameNode): NewGameBoardValue {
        return new NewGameBoardValue(0);
    }
}

/**
 * What is called "minimaxes" here are heuristic calculators.
 * They assign a score to a state so that the `LocalGameWrappercomponent` can
 * use it within the AI system to know which move to play.
 *
 * By convention, we call such a class a "dummy minimax" if:
 *   - it doesn't filter any move in `getListMoves`
 *   - it has a simplistic `getBoardValue`, only relying the score stored in the state
 */
export class NewGameDummyMinimax extends Minimax<NewGameMove, NewGameState, NewGameLegalityInfo, NewGameBoardValue> {

    public constructor() {
        super('Dummy Minimax', NewGameRules.get(), new NewGameHeuristic(), new NewGameMoveGenerator());
    }
}
