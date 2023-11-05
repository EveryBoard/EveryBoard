/* eslint-disable max-lines-per-function */
import { defaultGobanConfig } from 'src/app/jscaip/GobanConfig';
import { PenteMove } from '../PenteMove';
import { PenteMoveGenerator } from '../PenteMoveGenerator';
import { PenteNode } from '../PenteRules';
import { PenteState } from '../PenteState';

describe('PenteMoveGenerator', () => {

    let moveGenerator: PenteMoveGenerator;

    beforeEach(() => {
        moveGenerator = new PenteMoveGenerator();
    });
    it('should propose exactly 360 moves at first turn', () => {
        // Given the initial state
        const node: PenteNode = new PenteNode(PenteState.getInitialState(defaultGobanConfig));

        // When listing the moves
        const moves: PenteMove[] = moveGenerator.getListMoves(node);

        // Then it should have one move per empty space, i.e., 19x19 - 1 = 360
        expect(moves.length).toBe(360);
    });
});
