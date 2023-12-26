/* eslint-disable max-lines-per-function */
import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { PenteMove } from '../PenteMove';
import { PenteMoveGenerator } from '../PenteMoveGenerator';
import { PenteNode, PenteRules } from '../PenteRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('PenteMoveGenerator', () => {

    let moveGenerator: PenteMoveGenerator;
    const defaultConfig: MGPOptional<GobanConfig> = PenteRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new PenteMoveGenerator();
    });

    it('should propose exactly 360 moves at first turn', () => {
        // Given the initial state
        const node: PenteNode = new PenteNode(PenteRules.get().getInitialState(defaultConfig));

        // When listing the moves
        const moves: PenteMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should have one move per empty space, i.e., 19x19 - 1 = 360
        expect(moves.length).toBe(360);
    });

});
