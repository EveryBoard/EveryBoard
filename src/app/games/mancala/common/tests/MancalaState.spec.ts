import { MancalaState } from '../MancalaState';

describe('MancalaState', () => {

    it('should compare correctly', () => {
        // Given an initial state
        const state: MancalaState = new MancalaState([
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ], 0, [0, 0]);
        // and state with different board
        const differentBoard: MancalaState = new MancalaState([
            [1, 2, 3, 4, 5, 6],
            [1, 2, 3, 4, 5, 6],
        ], state.turn, state.scores);
        // and a state with different scores
        const differentScore: MancalaState =
            new MancalaState(state.board, state.turn, [28, 52]);
        // and a state with a different turn
        const differentTurn: MancalaState =
            new MancalaState(state.board, state.turn + 1, state.scores);

        // When comparing the three to the original one
        // Then it should all be false, as they are different
        expect(state.equals(differentBoard)).toBeFalse();
        expect(state.equals(differentScore)).toBeFalse();
        expect(state.equals(differentTurn)).toBeFalse();
    });

});
