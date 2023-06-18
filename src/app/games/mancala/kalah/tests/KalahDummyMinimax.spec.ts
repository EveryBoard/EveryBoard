import { KalahDummyMinimax } from '../KalahDummyMinimax';
import { KalahMove } from '../KalahMove';
import { KalahNode } from '../KalahRules';
import { MancalaState } from '../../MancalaState';

describe('KalahDummyMinimax', () => {

    let minimax: KalahDummyMinimax;

    beforeEach(() => {
        minimax = new KalahDummyMinimax();
    });
    it('should have all move options', () => {
        // Given an initial node
        const initialState: MancalaState = MancalaState.getInitialState();
        const node: KalahNode = new KalahNode(initialState);

        // When computing the list of moves
        const moves: KalahMove[] = minimax.getListMoves(node);

        // Then there should be 5 moves of one sub-moves, and 5 moves of two sub-moves
        expect(moves.length).toBe(10);
    });
});
