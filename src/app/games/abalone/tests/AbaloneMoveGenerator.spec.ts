/* eslint-disable max-lines-per-function */
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { Table } from 'src/app/utils/ArrayUtils';
import { AbaloneMoveGenerator } from '../AbaloneMoveGenerator';
import { AbaloneNode } from '../AbaloneRules';
import { AbaloneState } from '../AbaloneState';

const _: FourStatePiece = FourStatePiece.EMPTY;
const N: FourStatePiece = FourStatePiece.UNREACHABLE;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;

describe('AbaloneMoveGenerator', () => {

    let moveGenerator: AbaloneMoveGenerator;

    beforeEach(() => {
        moveGenerator = new AbaloneMoveGenerator();
    });
    it('should propose all non-suicidal moved at first turn, there is 42', () => {
        // Given initial node
        const initialState: AbaloneState = AbaloneState.getInitialState();
        const initialNode: AbaloneNode = new AbaloneNode(initialState);

        // Then we should have 44 moves
        expect(moveGenerator.getListMoves(initialNode).length).toEqual(44);
    });
    it('should include pushing moves', () => {
        // Given a simple node
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

        // Then we should have 15 moves
        expect(moveGenerator.getListMoves(node).length).toEqual(15);
    });
});
