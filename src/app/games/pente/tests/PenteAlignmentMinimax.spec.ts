import { PenteAlignmentMinimax } from '../PenteAlignmentMinimax';
import { PenteMove } from '../PenteMove';
import { PenteNode, PenteRules } from '../PenteRules';
import { PenteState } from '../PenteState';

describe('PenteAlignmentMinimax', () => {
    let rules: PenteRules;
    let minimax: PenteAlignmentMinimax;

    beforeEach(() => {
        rules = PenteRules.get();
        minimax = new PenteAlignmentMinimax(rules, 'PenteAlignmentMinimax');
    });
    it('should propose exactly 360 moves at first turn', () => {
        // Given the initial state
        const node: PenteNode = new PenteNode(PenteState.getInitialState());
        // When computing all possible moves
        const moves: PenteMove[] = minimax.getListMoves(node);
        // Then it should have one move per empty space, i.e., 19x19 - 1 = 360
        expect(moves.length).toBe(360);
    });
});
