/* eslint-disable max-lines-per-function */
import { DvonnOrderedMoveGenerator } from '../DvonnOrderedMoveGenerator';
import { DvonnNode, DvonnRules } from '../DvonnRules';

describe('DvonnOrderedMoveGenerator', () => {

    let rules: DvonnRules;
    let moveGenerator: DvonnOrderedMoveGenerator;

    beforeEach(() => {
        rules = DvonnRules.get();
        moveGenerator = new DvonnOrderedMoveGenerator();
    });
    it('should propose 41 moves at first turn', () => {
        const node: DvonnNode = rules.getInitialNode();
        expect(moveGenerator.getListMoves(node).length).toBe(41);
    });
});
