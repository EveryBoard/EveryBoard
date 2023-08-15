/* eslint-disable max-lines-per-function */
import { SaharaNode, SaharaRules } from '../SaharaRules';
import { SaharaMove } from '../SaharaMove';
import { SaharaMoveGenerator } from '../SaharaMoveGenerator';

describe('SaharaMoveGenerator', () => {
    it('should generate 12 moves at first turn', () => {
        const moveGenerator: SaharaMoveGenerator = new SaharaMoveGenerator();
        const node: SaharaNode = SaharaRules.get().getInitialNode();
        const moves: SaharaMove[] = moveGenerator.getListMoves(node);
        expect(moves.length).toEqual(12);
    });
});