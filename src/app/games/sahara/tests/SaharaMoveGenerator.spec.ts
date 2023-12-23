/* eslint-disable max-lines-per-function */
import { SaharaNode, SaharaRules } from '../SaharaRules';
import { SaharaMove } from '../SaharaMove';
import { SaharaMoveGenerator } from '../SaharaMoveGenerator';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('SaharaMoveGenerator', () => {

    const defaultConfig: NoConfig = SaharaRules.get().getDefaultRulesConfig();

    it('should generate 12 moves at first turn', () => {
        const moveGenerator: SaharaMoveGenerator = new SaharaMoveGenerator();
        const node: SaharaNode = SaharaRules.get().getInitialNode(defaultConfig);
        const moves: SaharaMove[] = moveGenerator.getListMoves(node, defaultConfig);
        expect(moves.length).toEqual(12);
    });

});
