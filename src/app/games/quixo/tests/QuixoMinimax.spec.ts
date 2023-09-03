/* eslint-disable max-lines-per-function */
import { Orthogonal } from 'src/app/jscaip/Direction';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { QuixoState } from '../QuixoState';
import { QuixoMove } from '../QuixoMove';
import { QuixoMinimax } from '../QuixoMinimax';
import { QuixoNode, QuixoRules } from '../QuixoRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('QuixoMinimax', () => {

    let minimax: QuixoMinimax;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        const rules: QuixoRules = QuixoRules.get();
        minimax = new QuixoMinimax(rules, 'QuixoMinimax');
    });

    it('should compute board value according to longest line differences', () => {
        const board: Table<PlayerOrNone> = [
            [X, _, _, _, O],
            [X, _, _, _, O],
            [_, _, _, _, _],
            [_, _, _, _, O],
            [X, _, _, _, O],
        ];
        const state: QuixoState = new QuixoState(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const node: QuixoNode = new QuixoNode(state, MGPOptional.empty(), MGPOptional.of(move));
        expect(minimax.getBoardValue(node).value).toEqual(-1);
    });
});