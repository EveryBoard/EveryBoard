/* eslint-disable max-lines-per-function */
import { Direction } from 'src/app/jscaip/Direction';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI';
import { Minimax } from 'src/app/jscaip/Minimax';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { EpaminondasRules, EpaminondasLegalityInformation } from '../EpaminondasRules';
import { EpaminondasHeuristic } from '../EpaminondasHeuristic';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasNode } from '../EpaminondasRules';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasMoveGenerator } from '../EpaminondasMoveGenerator';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('EpaminondasMinimax', () => {

    let minimax: Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };

    beforeEach(() => {
        minimax = new Minimax('Minimax', EpaminondasRules.get(), new EpaminondasHeuristic(), new EpaminondasMoveGenerator());
    });
    it('should consider possible capture the best move', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: EpaminondasState = new EpaminondasState(board, 0);
        const node: EpaminondasNode = new EpaminondasNode(state);
        const capture: EpaminondasMove = new EpaminondasMove(4, 9, 2, 1, Direction.UP);
        const bestMove: EpaminondasMove = minimax.chooseNextMove(node, minimaxOptions);
        expect(bestMove).toEqual(capture);
    });
});
