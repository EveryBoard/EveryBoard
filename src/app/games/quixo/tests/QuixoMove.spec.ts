/* eslint-disable max-lines-per-function */
import { Orthogonal } from 'src/app/jscaip/Direction';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { QuixoConfig, QuixoState } from '../QuixoState';
import { QuixoNode, QuixoRules } from '../QuixoRules';
import { QuixoMove } from '../QuixoMove';
import { EncoderTestUtils, MGPOptional } from '@everyboard/lib';
import { Table } from 'src/app/jscaip/TableUtils';
import { QuixoMoveGenerator } from '../QuixoMoveGenerator';

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
        const move: QuixoMove = new QuixoMove(0, 0, Orthogonal.DOWN);
        const state: QuixoState = new QuixoState(board, 0);
        const node: QuixoNode = new QuixoNode(state, MGPOptional.empty(), MGPOptional.of(move));
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
