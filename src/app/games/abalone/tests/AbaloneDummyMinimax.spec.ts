/* eslint-disable max-lines-per-function */
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/utils/ArrayUtils';
import { AbaloneDummyMinimax } from '../AbaloneDummyMinimax';
import { AbaloneState } from '../AbaloneState';
import { AbaloneNode, AbaloneRules } from '../AbaloneRules';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Player } from 'src/app/jscaip/Player';

describe('AbaloneDummyMinimax', () => {

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    let minimax: AbaloneDummyMinimax;

    beforeEach(() => {
        minimax = new AbaloneDummyMinimax(new AbaloneRules(AbaloneState), 'dummy');
    });
    it('should propose all non-suicidal moved at first turn, there is 42', () => {
        // given initial node
        const initialState: AbaloneState = AbaloneState.getInitialState();
        const initialNode: AbaloneNode = new AbaloneNode(initialState);

        // then we should have 42 moves
        expect(minimax.getListMoves(initialNode).length).toEqual(44);
    });
    it('should include pushing moves', () => {
        // given a simple node
        const board: Table<FourStatePiece> = [
            [N, N, N, N, _, _, _, _, _],
            [N, N, N, _, _, _, _, _, _],
            [N, N, _, _, _, _, _, _, _],
            [N, _, _, _, _, _, _, _, _],
            [X, O, O, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, _, _, _, _, _, N, N],
            [_, _, _, _, _, _, N, N, N],
            [_, _, _, _, _, N, N, N, N],
        ];
        const state: AbaloneState = new AbaloneState(board, 0);
        const node: AbaloneNode = new AbaloneNode(state);

        // then we should have 42 moves
        expect(minimax.getListMoves(node).length).toEqual(15);
    });
    it('should assign a higher score when one has more pieces on board', () => {
        // Given two boards, one with more player piece than the other
        const boardWithLessPieces: Table<FourStatePiece> = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, O, O, _, _, _, N, N],
            [O, O, O, O, _, O, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        const boardWithMorePieces: Table<FourStatePiece> = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, X, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, N],
            [_, _, O, O, O, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        // When computing the scores
        // The the board with the most player pieces should have the highest score
        RulesUtils.expectSecondStateToBeBetterThanFirstFor(minimax,
                                                           new AbaloneState(boardWithLessPieces, 0),
                                                           MGPOptional.empty(),
                                                           new AbaloneState(boardWithMorePieces, 0),
                                                           MGPOptional.empty(),
                                                           Player.ZERO);
    });
});
