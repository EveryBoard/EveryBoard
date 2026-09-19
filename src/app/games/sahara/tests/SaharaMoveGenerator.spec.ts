/* eslint-disable max-lines-per-function */
import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { SaharaMove } from '../SaharaMove';
import { SaharaMoveGenerator } from '../SaharaMoveGenerator';
import { SaharaNode, SaharaRules } from '../SaharaRules';

describe('SaharaMoveGenerator', () => {

    const defaultConfig: EmptyRulesConfig = SaharaRules.get().getDefaultRulesConfig();

    it('should generate 12 moves at first turn', () => {
        const moveGenerator: SaharaMoveGenerator = new SaharaMoveGenerator();
        const node: SaharaNode = SaharaRules.get().getInitialNode(defaultConfig);
        const moves: SaharaMove[] = moveGenerator.getListMoves(node, defaultConfig);
        expect(moves.length).toEqual(12);
    });

});
