/* eslint-disable max-lines-per-function */
import { EpaminondasMoveGenerator } from '../EpaminondasMoveGenerator';
import { EpaminondasConfig, EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';

describe('EpaminondasMoveGenerator', () => {

    let rules: EpaminondasRules = EpaminondasRules.get();
    let moveGenerator: EpaminondasMoveGenerator;
    const config: EpaminondasConfig = rules.getRulesConfigDescription().get().getDefaultConfig().config;

    beforeEach(() => {
        rules = EpaminondasRules.get();
        moveGenerator = new EpaminondasMoveGenerator();
    });
    it('should propose 114 moves at first turn', () => {
        const node: EpaminondasNode = rules.getInitialNode(config);
        expect(moveGenerator.getListMoves(node).length).toBe(114);
    });
});
