/* eslint-disable max-lines-per-function */
import { DiamMoveGenerator } from '../DiamMoveGenerator';
import { DiamPiece } from '../DiamPiece';
import { DiamNode } from '../DiamRules';
import { DiamState } from '../DiamState';

describe('DiamMoveGenerator', () => {

    let moveGenerator: DiamMoveGenerator;

    const __: DiamPiece = DiamPiece.EMPTY;
    const A1: DiamPiece = DiamPiece.ZERO_FIRST;
    const A2: DiamPiece = DiamPiece.ZERO_SECOND;
    const B1: DiamPiece = DiamPiece.ONE_FIRST;
    const B2: DiamPiece = DiamPiece.ONE_SECOND;

    beforeEach(() => {
        moveGenerator = new DiamMoveGenerator();
    });
    it('should propose 16 moves at first turn', () => {
        const node: DiamNode = new DiamNode(DiamState.getInitialState());
        expect(moveGenerator.getListMoves(node).length).toBe(16);
    });
    it('should detect shift moves', () => {
        // Given a state there can be a shift
        const state: DiamState = DiamState.ofRepresentation([
            [__, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, A1],
            [B1, __, __, __, __, __, __, B2],
            [A1, __, __, __, __, __, __, A2],
        ], 4);
        const node: DiamNode = new DiamNode(state);
        // Then there are 16 + 4 move
        expect(moveGenerator.getListMoves(node).length).toBe(20);
    });
    it('should correctly filter moves to full columns', () => {
        // Given a state there can be a shift
        const state: DiamState = DiamState.ofRepresentation([
            [__, __, __, __, __, __, __, A1],
            [__, __, __, __, __, __, __, B1],
            [__, __, __, __, __, __, __, A2],
            [__, __, __, __, __, __, __, B2],
        ], 4);
        const node: DiamNode = new DiamNode( state);
        // Then there are 14 + 4 move
        expect(moveGenerator.getListMoves(node).length).toBe(18);
    });
});