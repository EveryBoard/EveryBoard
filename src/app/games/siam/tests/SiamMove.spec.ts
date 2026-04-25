/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { EncoderTestUtils } from '@everyboard/lib/testing';

import { Orthogonal } from '../../../jscaip/Orthogonal';
import { Table } from '../../../jscaip/TableUtils';
import { SiamMove } from '../SiamMove';
import { SiamMoveGenerator } from '../SiamMoveGenerator';
import { SiamPiece } from '../SiamPiece';
import { SiamConfig, SiamNode, SiamRules } from '../SiamRules';
import { SiamState } from '../SiamState';

describe('SiamMove', () => {

    const _: SiamPiece = SiamPiece.EMPTY;
    const M: SiamPiece = SiamPiece.MOUNTAIN;
    const D: SiamPiece = SiamPiece.LIGHT_DOWN;
    const defaultConfig: MGPOptional<SiamConfig> = SiamRules.get().getDefaultRulesConfig();

    it('should have a bijective encoder', () => {
        const board: Table<SiamPiece> = [
            [_, _, D, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const move: SiamMove = SiamMove.of(0, 0, MGPOptional.of(Orthogonal.DOWN), Orthogonal.UP);
        const state: SiamState = new SiamState(board, 0);
        const node: SiamNode =
            new SiamNode(state, undefined, MGPOptional.of(move));
        const moveGenerator: SiamMoveGenerator = new SiamMoveGenerator();
        const moves: SiamMove[] = moveGenerator.getListMoves(node, defaultConfig);
        for (const firstMove of moves) {
            EncoderTestUtils.expectToBeBijective(SiamMove.encoder, firstMove);
        }
    });

    it('should override equals correctly', () => {
        const moveA: SiamMove = SiamMove.of(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT);
        const twin: SiamMove = SiamMove.of(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT);
        const neighbor: SiamMove = SiamMove.of(3, 3, MGPOptional.of(Orthogonal.UP), Orthogonal.RIGHT);
        const cousin: SiamMove = SiamMove.of(2, 2, MGPOptional.of(Orthogonal.DOWN), Orthogonal.RIGHT);
        const stranger: SiamMove = SiamMove.of(2, 2, MGPOptional.of(Orthogonal.UP), Orthogonal.LEFT);
        expect(moveA.equals(moveA)).toBeTrue();
        expect(moveA.equals(twin)).toBeTrue();
        expect(moveA.equals(neighbor)).toBeFalse();
        expect(moveA.equals(cousin)).toBeFalse();
        expect(moveA.equals(stranger)).toBeFalse();
    });

});
