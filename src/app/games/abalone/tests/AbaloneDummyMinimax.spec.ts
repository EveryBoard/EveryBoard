import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { AbaloneDummyMinimax } from '../AbaloneDummyMinimax';
import { AbaloneGameState } from '../AbaloneGameState';
import { AbaloneNode, AbaloneRules } from '../AbaloneRules';

describe('AbaloneDummyMinimax', () => {

    const _: number = FourStatePiece.EMPTY.value;
    const N: number = FourStatePiece.NONE.value;
    const O: number = FourStatePiece.ZERO.value;
    const X: number = FourStatePiece.ONE.value;
    let minimax: AbaloneDummyMinimax;

    beforeEach(() => {
        minimax = new AbaloneDummyMinimax(new AbaloneRules(AbaloneGameState), 'dummy');
    });
    it('should propose all non-suicidal moved at first turn, there is 42', () => {
        // given initial node
        const initialState: AbaloneGameState = AbaloneGameState.getInitialState();
        const initialNode: AbaloneNode = new MGPNode(null, null, initialState);

        // then we should have 42 moves
        expect(minimax.getListMoves(initialNode).length).toEqual(44);
    });
    it('should include pushing moves', () => {
        // given a simple node
        const board: NumberTable = [
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
        const initialState: AbaloneGameState = new AbaloneGameState(board, 0);
        const initialNode: AbaloneNode = new MGPNode(null, null, initialState);

        // then we should have 42 moves
        expect(minimax.getListMoves(initialNode).length).toEqual(15);
    });
});
