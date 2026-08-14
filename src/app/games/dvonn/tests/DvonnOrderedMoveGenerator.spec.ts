/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '@everyboard/games';

import { DvonnOrderedMoveGenerator } from '../DvonnOrderedMoveGenerator';
import { DvonnNode, DvonnRules } from '../DvonnRules';

describe('DvonnOrderedMoveGenerator', () => {

    let rules: DvonnRules;
    let moveGenerator: DvonnOrderedMoveGenerator;
    const defaultConfig: EmptyRulesConfig = DvonnRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = DvonnRules.get();
        moveGenerator = new DvonnOrderedMoveGenerator();
    });

    it('should propose 41 moves at first turn', () => {
        const node: DvonnNode = rules.getInitialNode(defaultConfig);
        expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(41);
    });

});
