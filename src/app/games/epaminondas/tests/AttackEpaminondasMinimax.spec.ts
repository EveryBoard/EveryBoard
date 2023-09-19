/* eslint-disable max-lines-per-function */
import { Direction } from 'src/app/jscaip/Direction';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { AttackEpaminondasMinimax } from '../AttackEpaminondasMinimax';
import { EpaminondasMove } from '../EpaminondasMove';
import { EpaminondasState } from '../EpaminondasState';
import { EpaminondasNode, EpaminondasRules, epaminondasConfig } from '../EpaminondasRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('AttackEpaminondasMinimax', () => {

    let rules: EpaminondasRules;
    let minimax: AttackEpaminondasMinimax;
    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    beforeEach(() => {
        rules = EpaminondasRules.get();
        minimax = new AttackEpaminondasMinimax(rules, 'AttackEpaminondasMinimax');
    });
    it('should propose 114 moves at first turn', () => {
        const node: EpaminondasNode = rules.getInitialNode(epaminondasConfig);
        expect(minimax.getListMoves(node).length).toBe(114);
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
        const bestMove: EpaminondasMove = node.findBestMove(1, minimax);
        expect(bestMove).toEqual(expectedMove);
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
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           lesserState, MGPOptional.empty(),
                                                           greaterState, MGPOptional.empty(),
                                                           Player.ONE);
    });
});
