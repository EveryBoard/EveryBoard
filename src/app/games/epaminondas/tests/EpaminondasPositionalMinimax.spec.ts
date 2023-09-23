/* eslint-disable max-lines-per-function */
import { Table } from 'src/app/utils/ArrayUtils';
import { Direction } from 'src/app/jscaip/Direction';
import { Minimax } from 'src/app/jscaip/Minimax';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasLegalityInformation, EpaminondasNode } from '../EpaminondasRules';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasPositionalMinimax } from '../EpaminondasPositionalMinimax';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasPositionalMinimax', () => {

    let minimax: Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };

    beforeEach(() => {
        minimax = new EpaminondasPositionalMinimax();
    });
    it('should consider possible capture the best move', () => {
        const board: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, _, _, _, _, _, _],
            [_, O, O, _, _, _, X, X, X, X, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 1);
        const node: EpaminondasNode = new EpaminondasNode(state);
        const expectedMove: EpaminondasMove = new EpaminondasMove(9, 1, 4, 4, Direction.LEFT);
        const bestMove: EpaminondasMove = minimax.chooseNextMove(node, minimaxOptions);

        expect(bestMove).toEqual(expectedMove);
    });
});
