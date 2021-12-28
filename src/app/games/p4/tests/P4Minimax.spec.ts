/* eslint-disable max-lines-per-function */
import { P4Minimax } from '../P4Minimax';
import { P4Move } from '../P4Move';
import { P4State } from '../P4State';
import { P4Node, P4Rules } from '../P4Rules';
import { Player } from 'src/app/jscaip/Player';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('P4Minimax', () => {

    let minimax: P4Minimax;
    let rules: P4Rules;
    const O: Player = Player.ZERO;
    const X: Player = Player.ONE;
    const _: Player = Player.NONE;

    beforeEach(() => {
        rules = new P4Rules(P4State);
        minimax = new P4Minimax(rules, 'P4Minimax');
    });
    it('Should know when a column is full or not', () => {
        const board: Player[][] = [
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, O, X, O, X, O, X],
        ];
        const state: P4State = new P4State(board, 12);
        const node: P4Node = new P4Node(state);
        expect(minimax.getListMoves(node).length).toBe(6);
    });
    it('should assign greater score to center column', () => {
        const weakBoard: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, O],
        ];
        const weakState: P4State = new P4State(weakBoard, 0);
        const strongBoard: Player[][] = [
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
        ];
        const strongState: P4State = new P4State(strongBoard, 0);

        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           weakState, MGPOptional.empty(),
                                                           strongState, MGPOptional.empty(),
                                                           Player.ZERO);
    });
    it('First choice should be center at all IA depths', () => {
        const initialState: P4State = P4State.getInitialState();
        for (let depth: number = 1; depth < 6; depth ++) {
            const node: P4Node = new P4Node(initialState);
            expect(node.findBestMove(depth, minimax)).toEqual(P4Move.THREE);
        }
    });
    it('Minimax should prune when instructed to do so', () => {
        const getBoardValueSpy: jasmine.Spy = spyOn(minimax, 'getBoardValue').and.callThrough();
        const getListMovesSpy: jasmine.Spy = spyOn(minimax, 'getListMoves').and.callThrough();

        // Given the number of moves of a minimax without alpha-beta pruning
        rules.node.findBestMove(3, minimax, false, false);
        const callsToGetBoardValueWithoutPruning: number = getBoardValueSpy.calls.count();
        getBoardValueSpy.calls.reset();
        const callsToGetListMovesWithoutPruning: number = getListMovesSpy.calls.count();
        getListMovesSpy.calls.reset();

        // when computing the same information with alpha-beta pruning enabled
        rules.node = new P4Node(P4State.getInitialState());
        rules.node.findBestMove(3, minimax, false, true);
        const callsToGetBoardValueWithPruning: number = getBoardValueSpy.calls.count();
        const callsToGetListMovesWithPruning: number = getListMovesSpy.calls.count();

        // then the number of calls is strictly lower
        expect(callsToGetBoardValueWithPruning).toBeLessThan(callsToGetBoardValueWithoutPruning);
        expect(callsToGetListMovesWithPruning).toBeLessThan(callsToGetListMovesWithoutPruning);
    });
});
