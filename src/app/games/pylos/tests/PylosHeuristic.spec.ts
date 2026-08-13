/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { EmptyRulesConfig } from '../../../jscaip/RulesConfigUtil';
import { PylosCoord } from '../PylosCoord';
import { PylosHeuristic } from '../PylosHeuristic';
import { PylosMove } from '../PylosMove';
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
        const move: PylosMove = PylosMove.ofDrop(new PylosCoord(2, 2, 1), []);
        const node: PylosNode = new PylosNode(state, MGPOptional.empty(), MGPOptional.of(move));
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;
        expect(boardValue).toEqual([0]);
    });

});
