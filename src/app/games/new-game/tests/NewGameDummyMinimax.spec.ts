import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { NewGameDummyMinimax, NewGameHeuristic, NewGameMoveGenerator } from '../NewGameDummyMinimax';
import { NewGameMove } from '../NewGameMove';
import { NewGameNode } from '../NewGameRules';
import { NewGameState } from '../NewGameState';

/**
 * These are the tests for the move generator.
 * We want to test that it gives us the expected moves.
 * Typically, this can be done by checking the number of moves available on the first turn of a game.
 */
describe('NewGameMoveGenerator', () => {

    let moveGenerator: NewGameMoveGenerator;

    beforeEach(() => {
        moveGenerator = new NewGameMoveGenerator();
    });
    it('should have all move options', () => {
        // Given an initial node
        const initialState: NewGameState = NewGameState.getInitialState();
        const node: NewGameNode = new NewGameNode(initialState);

        // When computing the list of moves
        const moves: NewGameMove[] = moveGenerator.getListMoves(node);

        // Then there should be this many moves
        expect(moves.length).toBe(0);
    });
});


/**
 * These are the tests for the heuristic.
 * We want to test that it gives some value on some boards, or rather that it assigns higher values to a board
 * compared to another one.
 * We can rely on HeuristicUtils' functions to achieve this.
 */
describe('NewGameHeuristic', () => {

    let heuristic: NewGameHeuristic;

    beforeEach(() => {
        heuristic = new NewGameHeuristic();
    });
    it('should have some score', () => {
        /**
         * To test scores, most of the time you want to rely on `HeuristicUtils.expectSecondStateToBeBetterThanFirstFor`.
         */
        const initialState: NewGameState = NewGameState.getInitialState();
        HeuristicUtils.expectStatesToBeOfEqualValue(heuristic, initialState, initialState);
    });
});


/**
 * Because we tested the move generator and the heuristic, the minimax should be correct by default.
 * Hence, we only have to test that it is created correctly.
 */
describe('NewGameDummyMinimax', () => {
    it('should create', () => {
        expect(new NewGameDummyMinimax()).toBeTruthy();
    });
});
