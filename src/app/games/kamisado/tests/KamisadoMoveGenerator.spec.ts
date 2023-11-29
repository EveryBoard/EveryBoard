/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { KamisadoColor } from '../KamisadoColor';
import { KamisadoMove } from '../KamisadoMove';
import { KamisadoState } from '../KamisadoState';
import { KamisadoPiece } from '../KamisadoPiece';
import { KamisadoNode, KamisadoRules } from '../KamisadoRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { KamisadoMoveGenerator } from '../KamisadoMoveGenerator';

const _: KamisadoPiece = KamisadoPiece.EMPTY;
const R: KamisadoPiece = KamisadoPiece.ZERO.RED;
const r: KamisadoPiece = KamisadoPiece.ONE.RED;
const b: KamisadoPiece = KamisadoPiece.ONE.BROWN;
const G: KamisadoPiece = KamisadoPiece.ZERO.GREEN;

describe('KamisadoMoveGenerator', () => {

    let rules: KamisadoRules;
    let moveGenerator: KamisadoMoveGenerator;

    beforeEach(() => {
        rules = KamisadoRules.get();
        moveGenerator = new KamisadoMoveGenerator();
    });

    it('should provide 102 possible moves at turn 0', () => {
        // Each piece on the side can do 6 vertical moves and 6 diagonal ones = 12 moves per piece * 2 side pieces
        // Other pieces can do 6 vertical and 7 diagonal = 13 moves per piece * 6 pieces
        // In total, that makes 102 possible moves

        // Given the initial board
        const node: KamisadoNode = rules.getInitialNode(MGPOptional.empty());

        // When listing the moves
        const firstTurnMoves: KamisadoMove[] = moveGenerator.getListMoves(node);

        // Then there should be exactly 102 moves
        expect(firstTurnMoves.length).toEqual(102);
    });

    it('should return only Kamisado.PASS when position is stuck', () => {
        // Given a stuck board
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const node: KamisadoNode = new KamisadoNode(state);

        // When listing the moves
        const moves: KamisadoMove[] = moveGenerator.getListMoves(node);

        // Then the only choice should be KamisadoMove.PASS
        expect(moves.length).toEqual(1);
        const move: KamisadoMove = moves[0];
        expect(move).toEqual(KamisadoMove.PASS);
    });
    it('should return only one move when only one move is possible', () => {
        // Given a board where only one move is possible
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
        const node: KamisadoNode = new KamisadoNode(state);

        // When listing the moves
        const moves: KamisadoMove[] = moveGenerator.getListMoves(node);

        // Then there should only be that one legal move
        expect(moves.length).toEqual(1);
        const move: KamisadoMove = moves[0];
        expect(move).toEqual(KamisadoMove.of(new Coord(1, 6), new Coord(2, 7)));
    });
});
