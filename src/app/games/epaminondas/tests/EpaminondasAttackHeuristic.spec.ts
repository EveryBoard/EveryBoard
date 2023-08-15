/* eslint-disable max-lines-per-function */
import { Direction } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasLegalityInformation, EpaminondasNode, EpaminondasRules } from '../EpaminondasRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { AIDepthLimitOptions } from 'src/app/jscaip/AI';
import { Minimax } from 'src/app/jscaip/Minimax';
import { EpaminondasPhalanxSizeAndFilterMoveGenerator } from '../EpaminondasPhalanxSizeAndFilterMoveGenerator';
import { EpaminondasAttackHeuristic } from '../EpaminondasAttackHeuristic';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('AttackEpaminondasHeuristic', () => {

    let heuristic: EpaminondasAttackHeuristic;

    beforeEach(() => {
        heuristic = new EpaminondasAttackHeuristic();
    });
    it('should go forward', () => {
        const strongerBoard: Table<PlayerOrNone> = [
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
        const strongerState: EpaminondasState = new EpaminondasState(strongerBoard, 1);
        const weakerBoard: Table<PlayerOrNone> = [
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
        const weakerState: EpaminondasState = new EpaminondasState(weakerBoard, 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakerState, MGPOptional.empty(),
                                                               strongerState, MGPOptional.empty(),
                                                               Player.ONE);
    });
    it('should prefer going into the winning territory', () => {
        const strongerBoard: Table<PlayerOrNone> = [
            [_, O, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const strongerState: EpaminondasState = new EpaminondasState(strongerBoard, 1);
        const weakerBoard: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, O, O, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, _, _, _, _, _, _],
            [_, X, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const weakerState: EpaminondasState = new EpaminondasState(weakerBoard, 1);
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               strongerState, MGPOptional.empty(),
                                                               weakerState, MGPOptional.empty(),
                                                               Player.ONE);
    });
});

describe('EpaminondasAttackMinimax', () => {

    let minimax: Minimax<EpaminondasMove, EpaminondasState, EpaminondasLegalityInformation>;
    const minimaxOptions: AIDepthLimitOptions = { name: 'Level 1', maxDepth: 1 };

    beforeEach(() => {
        minimax = new Minimax('Attack Minimax',
                              EpaminondasRules.get(),
                              new EpaminondasAttackHeuristic(),
                              new EpaminondasPhalanxSizeAndFilterMoveGenerator());
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
