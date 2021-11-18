import { DiamDummyMinimax } from '../DiamDummyMinimax';
import { DiamPiece } from '../DiamPiece';
import { DiamNode, DiamRules } from '../DiamRules';
import { DiamState } from '../DiamState';

describe('DiamMinimax', () => {

    let rules: DiamRules;
    let minimax: DiamDummyMinimax;

    const __: DiamPiece = DiamPiece.EMPTY;
    const A1: DiamPiece = DiamPiece.ZERO_FIRST;
    const A2: DiamPiece = DiamPiece.ZERO_SECOND;
    const B1: DiamPiece = DiamPiece.ONE_FIRST;
    const B2: DiamPiece = DiamPiece.ONE_SECOND;

    beforeEach(() => {
        rules = new DiamRules(DiamState);
        minimax = new DiamDummyMinimax(rules, 'DiamDummyMinimax');
    });
    it('should propose 16 moves at first turn', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(16);
    });
    it('should detect shift moves', () => {
        // given a state there can be a shift
        const state: DiamState = new DiamState([
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, A1],
            [B1, __, __, __, __, __, __, B2],
            [A1, __, __, __, __, __, __, A2],
        ], [2, 3, 3, 3], 4);
        rules.node = new DiamNode(null, null, state);
        // then there are 16 + 4 move
        expect(minimax.getListMoves(rules.node).length).toBe(20);
    });
});
