/* eslint-disable max-lines-per-function */
import { SaharaNode, SaharaRules } from '../SaharaRules';
import { SaharaMove } from '../SaharaMove';
import { SaharaMoveGenerator } from '../SaharaMoveGenerator';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('SaharaMoveGenerator', () => {

    const defaultConfig: MGPOptional<EmptyRulesConfig> = SaharaRules.get().getDefaultRulesConfig();

    it('should generate 12 moves at first turn', () => {
        const moveGenerator: SaharaMoveGenerator = new SaharaMoveGenerator();
        const node: SaharaNode = SaharaRules.get().getInitialNode(MGPOptional.empty());
        const moves: SaharaMove[] = moveGenerator.getListMoves(node, defaultConfig);
        expect(moves.length).toEqual(12);
    });

});
