/* eslint-disable max-lines-per-function */
import { EpaminondasMoveGenerator } from '../EpaminondasMoveGenerator';
import { EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';

describe('EpaminondasMoveGenerator', () => {

    let rules: EpaminondasRules;
    let moveGenerator: EpaminondasMoveGenerator;

    beforeEach(() => {
        rules = EpaminondasRules.get();
        moveGenerator = new EpaminondasMoveGenerator();
    });
    it('should propose 114 moves at first turn', () => {
        const node: EpaminondasNode = rules.getInitialNode(EpaminondasRules.DEFAULT_CONFIG);
        expect(moveGenerator.getListMoves(node).length).toBe(114);
    });
});
