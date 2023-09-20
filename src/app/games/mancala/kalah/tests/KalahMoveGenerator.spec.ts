/* eslint-disable max-lines-per-function */
import { KalahMove } from '../KalahMove';
import { KalahNode, KalahRules } from '../KalahRules';
import { MancalaState } from '../../common/MancalaState';
import { KalahMoveGenerator } from '../KalahMoveGenerator';

describe('KalahMoveGenerator', () => {

    let moveGenerator: KalahMoveGenerator;

    beforeEach(() => {
        moveGenerator = new KalahMoveGenerator();
    });
    it('should have all move options', () => {
        // Given an initial node
        const initialState: MancalaState = MancalaState.getInitialState();
        const node: KalahNode = new KalahNode(initialState);

        // When computing the list of moves
        const moves: KalahMove[] = moveGenerator.getListMoves(node);

        // Then there should be 5 moves of one sub-moves, and 5 moves of two sub-moves
        expect(moves.length).toBe(10);
    });
    it('Given a state where possible moves must end in Kalah', () => {
        // Given a state with possible moves
        const state: MancalaState = new MancalaState([
            [5, 2, 3, 2, 1, 2],
            [1, 0, 0, 0, 0, 0],
        ], 24, [13, 20]);
        const node: KalahNode = new KalahNode(state);

        // When calculating the list of possible moves
        const moves: KalahMove[] = moveGenerator.getListMoves(node);

        // Then there should be those moves
        expect(moves.length).toBe(1);
    });
});
