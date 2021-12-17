import { Orthogonal } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { QuixoState } from '../QuixoState';
import { QuixoNode, QuixoRules } from '../QuixoRules';
import { QuixoMinimax } from '../QuixoMinimax';
import { QuixoMove } from '../QuixoMove';
import { QuixoFailure } from '../QuixoFailure';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('QuixoMove:', () => {

    const _: Player = Player.NONE;
    const X: Player = Player.ONE;

    it('Should forbid move creation for invalid x or y coord', () => {
        expect(() => new QuixoMove(-1, 0, Orthogonal.UP))
            .toThrowError('Invalid coord for QuixoMove: (-1, 0) is outside the board.');
    });
    it('Should forbid move creation from coord not on the side', () => {
        expect(() => new QuixoMove(1, 1, Orthogonal.UP))
            .toThrowError(QuixoFailure.NO_INSIDE_CLICK());
    });
    it('Should forbid move creation from board whose side is the same as the direction', () => {
        expect(() => new QuixoMove(0, 2, Orthogonal.LEFT))
            .toThrowError(`Invalid direction: pawn on the left side can't be moved to the left.`);
        expect(() => new QuixoMove(4, 2, Orthogonal.RIGHT))
            .toThrowError(`Invalid direction: pawn on the right side can't be moved to the right.`);
        expect(() => new QuixoMove(2, 0, Orthogonal.UP))
            .toThrowError(`Invalid direction: pawn on the top side can't be moved up.`);
        expect(() => new QuixoMove(2, 4, Orthogonal.DOWN))
            .toThrowError(`Invalid direction: pawn on the bottom side can't be moved down.`);
    });
    it('QuixoMove.encoder should be correct', () => {
        const board: Table<Player> = [
            [_, X, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [X, _, _, _, _],
            [_, _, _, X, _],
        ];
        const move: QuixoMove = new QuixoMove(0, 0, Orthogonal.DOWN);
        const state: QuixoState = new QuixoState(board, 0);
        const node: QuixoNode = new QuixoNode(state, MGPOptional.empty(), MGPOptional.of(move));
        const rules: QuixoRules = new QuixoRules(QuixoState);
        const minimax: QuixoMinimax = new QuixoMinimax(rules, 'QuixoMinimax');
        const moves: QuixoMove[] = minimax.getListMoves(node);
        for (const move of moves) {
            NumberEncoderTestUtils.expectToBeCorrect(QuixoMove.encoder, move);
        }
    });
    it('Should override correctly equals and toString', () => {
        const move: QuixoMove = new QuixoMove(0, 0, Orthogonal.RIGHT);
        const neighboor: QuixoMove = new QuixoMove(0, 1, Orthogonal.RIGHT);
        const twin: QuixoMove = new QuixoMove(0, 0, Orthogonal.RIGHT);
        const cousin: QuixoMove = new QuixoMove(0, 0, Orthogonal.DOWN);
        expect(move.equals(move)).toBeTrue();
        expect(move.equals(neighboor)).toBeFalse();
        expect(move.equals(cousin)).toBeFalse();
        expect(move.equals(twin)).toBeTrue();
        expect(move.toString()).toBe('QuixoMove(0, 0, RIGHT)');
    });
});
