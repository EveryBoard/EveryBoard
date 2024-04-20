/* eslint-disable max-lines-per-function */
import { Orthogonal } from 'src/app/jscaip/Direction';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { QuixoConfig, QuixoState } from '../QuixoState';
import { QuixoMove } from '../QuixoMove';
import { Table } from 'src/app/jscaip/TableUtils';
import { MGPOptional } from '@everyboard/lib';
import { QuixoNode, QuixoRules } from '../QuixoRules';
import { QuixoHeuristic } from '../QuixoHeuristic';

describe('QuixoHeuristic', () => {

    let heuristic: QuixoHeuristic;
    const defaultConfig: MGPOptional<QuixoConfig> = QuixoRules.get().getDefaultRulesConfig();
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
