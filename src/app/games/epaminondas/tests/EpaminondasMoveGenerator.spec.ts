/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EpaminondasMoveGenerator } from '../EpaminondasMoveGenerator';
import { EpaminondasConfig, EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';

describe('EpaminondasMoveGenerator', () => {

    let rules: EpaminondasRules = EpaminondasRules.get();
    let moveGenerator: EpaminondasMoveGenerator;
    const defaultConfig: MGPOptional<EpaminondasConfig> = rules.getDefaultRulesConfig();

    beforeEach(() => {
        rules = EpaminondasRules.get();
        moveGenerator = new EpaminondasMoveGenerator();
    });
    it('should propose 114 moves at first turn', () => {
        const node: EpaminondasNode = rules.getInitialNode(defaultConfig);
        expect(moveGenerator.getListMoves(node).length).toBe(114);
    });
});
