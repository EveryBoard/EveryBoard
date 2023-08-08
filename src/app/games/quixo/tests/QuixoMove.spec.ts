/* eslint-disable max-lines-per-function */
import { Orthogonal } from 'src/app/jscaip/Direction';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { QuixoState } from '../QuixoState';
import { QuixoNode } from '../QuixoRules';
import { QuixoMoveGenerator } from '../QuixoMinimax';
import { QuixoMove } from '../QuixoMove';
import { QuixoFailure } from '../QuixoFailure';
import { EncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('QuixoMove', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    it('should forbid move creation for invalid x or y coord', () => {
        expect(() => new QuixoMove(-1, 0, Orthogonal.UP))
            .toThrowError('Invalid coord for QuixoMove: (-1, 0) is outside the board.');
    });
    it('should forbid move creation from coord not on the side', () => {
        expect(() => new QuixoMove(1, 1, Orthogonal.UP))
            .toThrowError(QuixoFailure.NO_INSIDE_CLICK());
    });
    it('should forbid move creation from board whose side is the same as the direction', () => {
        expect(() => new QuixoMove(0, 2, Orthogonal.LEFT))
            .toThrowError(`Invalid direction: pawn on the left side can't be moved to the left.`);
        expect(() => new QuixoMove(4, 2, Orthogonal.RIGHT))
            .toThrowError(`Invalid direction: pawn on the right side can't be moved to the right.`);
        expect(() => new QuixoMove(2, 0, Orthogonal.UP))
            .toThrowError(`Invalid direction: pawn on the top side can't be moved up.`);
        expect(() => new QuixoMove(2, 4, Orthogonal.DOWN))
            .toThrowError(`Invalid direction: pawn on the bottom side can't be moved down.`);
    });
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
        const moves: QuixoMove[] = moveGenerator.getListMoves(node);
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
