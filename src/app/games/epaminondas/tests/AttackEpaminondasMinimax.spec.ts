/* eslint-disable max-lines-per-function */
import { Direction } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { AttackEpaminondasHeuristic, AttackEpaminondasMinimax } from '../AttackEpaminondasMinimax';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasNode } from '../EpaminondasRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { AIDepthLimitOptions } from 'src/app/jscaip/MGPNode';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('AttackEpaminondasHeuristic', () => {

    let heuristic: AttackEpaminondasHeuristic;

    beforeEach(() => {
        heuristic = new AttackEpaminondasHeuristic();
    });
    it('should go forward', () => {
        const greaterBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, O, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, O, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, O, _, O],
            [O, O, O, O, O, O, O, O, O, O, O, O, _, O],
        ];
        const greaterState: EpaminondasState = new EpaminondasState(greaterBoard, 1);
        const lesserBoard: Table<PlayerOrNone> = [
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [X, X, X, X, X, X, X, X, X, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, O, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, O, _, _],
            [_, _, _, _, _, _, _, _, _, _, O, O, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, O, O, O, O, O, O, _, _, O],
            [O, O, O, O, O, O, O, O, O, O, O, _, O, _],
        ];
        const lesserState: EpaminondasState = new EpaminondasState(lesserBoard, 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               lesserState, MGPOptional.empty(),
                                                               greaterState, MGPOptional.empty(),
                                                               Player.ONE);
    });
});

describe('AttackEpaminondasMinimax', () => {

    let minimax: AttackEpaminondasMinimax;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };

    beforeEach(() => {
        minimax = new AttackEpaminondasMinimax();
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
