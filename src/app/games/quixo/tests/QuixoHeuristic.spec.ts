/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { Orthogonal } from '../../../jscaip/Orthogonal';
import { Table } from '../../../jscaip/TableUtils';
import { QuixoHeuristic } from '../QuixoHeuristic';
import { QuixoMove } from '../QuixoMove';
import { QuixoNode, QuixoRules } from '../QuixoRules';
import { QuixoConfig, QuixoState } from '../QuixoState';

describe('QuixoHeuristic', () => {

    let heuristic: QuixoHeuristic;
    const defaultConfig: QuixoConfig = QuixoRules.get().getDefaultRulesConfig();
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        heuristic = new QuixoHeuristic();
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
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;
        expect(boardValue).toEqual([-1]);
    });

});
