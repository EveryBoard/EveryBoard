/* eslint-disable max-lines-per-function */
import { PylosCoord } from '../PylosCoord';
import { PylosMove } from '../PylosMove';
import { PylosState } from '../PylosState';
import { PylosNode } from '../PylosRules';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PylosHeuristic } from '../PylosHeuristic';
import { MGPOptional } from 'src/app/utils/MGPOptional';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('PylosHeuristic', () => {

    let heuristic: PylosHeuristic;

    beforeEach(() => {
        heuristic = new PylosHeuristic();
    });
    it('should calculate board value according to number of pawn of each player', () => {
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
        expect(heuristic.getBoardValue(node).value).toBe(0);
    });
});