/* eslint-disable max-lines-per-function */
import { EncoderTestUtils, MGPOptional } from '@everyboard/lib';

import { Orthogonal } from '../../../jscaip/Orthogonal';
import { PlayerOrNone } from '../../../jscaip/Player';
import { Table } from '../../../jscaip/TableUtils';
import { QuixoMove } from '../QuixoMove';
import { QuixoMoveGenerator } from '../QuixoMoveGenerator';
import { QuixoNode, QuixoRules } from '../QuixoRules';
import { QuixoConfig, QuixoState } from '../QuixoState';

describe('QuixoMove', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const X: PlayerOrNone = PlayerOrNone.ONE;
    const defaultConfig: MGPOptional<QuixoConfig> = QuixoRules.get().getDefaultRulesConfig();

    it('should have a bijective encoder', () => {
        const board: Table<PlayerOrNone> = [
            [_, X, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [X, _, _, _, _],
            [_, _, _, X, _],
        ];
        const previousMove: QuixoMove = new QuixoMove(0, 0, Orthogonal.DOWN);
        const state: QuixoState = new QuixoState(board, 0);
        const node: QuixoNode = new QuixoNode(state, MGPOptional.empty(), MGPOptional.of(previousMove));
        const moveGenerator: QuixoMoveGenerator = new QuixoMoveGenerator();
        const moves: QuixoMove[] = moveGenerator.getListMoves(node, defaultConfig);
        for (const move of moves) {
            EncoderTestUtils.expectToBeBijective(QuixoMove.encoder, move);
        }
    });

    it('should override correctly equals and toString', () => {
        const move: QuixoMove = new QuixoMove(0, 0, Orthogonal.RIGHT);
        const neighbor: QuixoMove = new QuixoMove(0, 1, Orthogonal.RIGHT);
        const twin: QuixoMove = new QuixoMove(0, 0, Orthogonal.RIGHT);
        const cousin: QuixoMove = new QuixoMove(0, 0, Orthogonal.DOWN);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighbor)).toBeFalse();
        expect(move.equals(cousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();
        expect(move.toString()).toBe('QuixoMove(0, 0, RIGHT)');
    });

});
