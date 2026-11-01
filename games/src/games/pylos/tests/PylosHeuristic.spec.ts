/* eslint-disable max-lines-per-function */

import { EmptyRulesConfig } from '../../../config/RulesConfig';
import { PlayerOrNone } from '../../../jscaip/Player';
import { PylosHeuristic } from '../PylosHeuristic';
import { PylosNode, PylosRules } from '../PylosRules';
import { PylosState } from '../PylosState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('PylosHeuristic', () => {

    let heuristic: PylosHeuristic;
    const defaultConfig: EmptyRulesConfig = PylosRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new PylosHeuristic();
    });

    it('should calculate board value according to number of piece of each player', () => {
        const board: PlayerOrNone[][][] = [
            [
                [O, X, O, X],
                [O, X, O, X],
                [O, X, O, X],
                [O, X, O, X],
            ], [
                [X, _, _],
                [_, O, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const node: PylosNode = PylosNode.root(state);
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;
        expect(boardValue).toEqual([0]);
    });

});
