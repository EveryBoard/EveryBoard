/* eslint-disable max-lines-per-function */
import { FourStatePiece } from '../../../../jscaip/FourStatePiece';
import { Ordinal } from '../../../../jscaip/Ordinal';
import { Table } from '../../../../jscaip/TableUtils';
import { RectangularShape } from '../../../../jscaip/shape/RectangularShape';
import { SimpleGameStateWithTable } from '../../../../jscaip/state/SimpleGameStateWithTable';
import { OrdinalSquareTopology } from '../../../../jscaip/topology/OrdinalSquareTopology';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ReversiNode } from '../AbstractReversiRules';
import { ReversiMove } from '../ReversiMove';
import { ReversiOrderedMoveGenerator } from '../ReversiOrderedMoveGenerator';
import { ReversiState } from '../ReversiState';

const _: FourStatePiece = FourStatePiece.EMPTY;
const O: FourStatePiece = FourStatePiece.ZERO;
const X: FourStatePiece = FourStatePiece.ONE;
const ordinalTopology: OrdinalSquareTopology = new OrdinalSquareTopology();
const squareShape: RectangularShape<Ordinal> = new RectangularShape(8, 8, ordinalTopology);

fdescribe('ReversiOrderedMoveGenerator', () => {

    let moveGenerator: ReversiOrderedMoveGenerator;

    beforeEach(() => {
        moveGenerator = new ReversiOrderedMoveGenerator(ReversiRules.get());
    });

    it('should propose moves on the corner first', () => {
        // Given a board where zero can play on a corner
        const board: Table<FourStatePiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, O, _, _],
            [_, _, _, _, _, O, _, _],
            [_, _, _, _, X, O, X, _],
        ];
        const gameState: SimpleGameStateWithTable<FourStatePiece> = new SimpleGameStateWithTable(board, 2);
        const state: ReversiState = new ReversiState(ordinalTopology, squareShape, gameState);
        const node: ReversiNode = new ReversiNode(state);

        // When listing the moves
        const moves: ReversiMove[] = moveGenerator.getListMoves(node);

        // Then it should contain the move in the corner first
        expect(moves.length).toBe(2);
        expect(moves[0]).toEqual(new ReversiMove(7, 7));
    });

});
