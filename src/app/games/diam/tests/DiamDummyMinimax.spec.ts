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
        rules = DiamRules.get();
        minimax = new DiamDummyMinimax(rules, 'DiamDummyMinimax');
    });
    it('should propose 16 moves at first turn', () => {
        rules.node = new DiamNode(DiamState.getInitialState());
        expect(minimax.getListMoves(rules.node).length).toBe(16);
    });
    it('should detect shift moves', () => {
        // given a state there can be a shift
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, A1],
            [B1, __, __, __, __, __, __, B2],
            [A1, __, __, __, __, __, __, A2],
        ], 4);
        rules.node = new DiamNode(state);
        // then there are 16 + 4 move
        expect(minimax.getListMoves(rules.node).length).toBe(20);
    });
    it('should correctly filter moves to full columns', () => {
        // given a state there can be a shift
        const state: DiamState = DiamState.fromRepresentation([
            [__, __, __, __, __, __, __, A1],
            [__, __, __, __, __, __, __, B1],
            [__, __, __, __, __, __, __, A2],
            [__, __, __, __, __, __, __, B2],
        ], 4);
        rules.node = new DiamNode( state);
        // then there are 14 + 4 move
        expect(minimax.getListMoves(rules.node).length).toBe(18);
    });
});
