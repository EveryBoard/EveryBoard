import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/utils/ArrayUtils';
import { AbaloneDummyMinimax } from '../AbaloneDummyMinimax';
import { AbaloneState } from '../AbaloneState';
import { AbaloneNode, AbaloneRules } from '../AbaloneRules';

describe('AbaloneDummyMinimax', () => {

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.NONE;
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
        const initialState: AbaloneState = new AbaloneState(board, 0);
        const initialNode: AbaloneNode = new AbaloneNode(initialState);

        // then we should have 42 moves
        expect(minimax.getListMoves(initialNode).length).toEqual(15);
    });
});
