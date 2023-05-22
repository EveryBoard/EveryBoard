/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { KamisadoColor } from '../KamisadoColor';
import { KamisadoMinimax } from '../KamisadoMinimax';
import { KamisadoMove } from '../KamisadoMove';
import { KamisadoState } from '../KamisadoState';
import { KamisadoPiece } from '../KamisadoPiece';
import { KamisadoNode, KamisadoRules } from '../KamisadoRules';
import { Table } from 'src/app/utils/ArrayUtils';

describe('KamisadoMinimax', () => {

    let rules: KamisadoRules;
    let minimax: KamisadoMinimax;

    const _: KamisadoPiece = KamisadoPiece.EMPTY;
    const R: KamisadoPiece = KamisadoPiece.ZERO.RED;
    const b: KamisadoPiece = KamisadoPiece.ONE.BROWN;

    beforeEach(() => {
        rules = KamisadoRules.get();
        minimax = new KamisadoMinimax(rules, 'KamisadoMinimax');
    });
    it('should provide 102 possible moves at turn 0', () => {
        // Each piece on the side can do 6 vertical moves and 6 diagonal ones = 12 moves per piece * 2 side pieces
        // Other pieces can do 6 vertical and 7 diagonal = 13 moves per piece * 6 pieces
        // In total, that makes 102 possible moves

        // Given the initial board
        // When computing all moves
        const node: KamisadoNode = rules.getInitialNode();
        const firstTurnMoves: KamisadoMove[] = minimax.getListMoves(node);
        // Then there should be exactly 102 moves
        expect(firstTurnMoves.length).toEqual(102);
    });
    it('should assign board values based on positions', () => {
        // Given a board with one piece for each player, where zero is closer to its goal than one
        const board: Table<KamisadoPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [R, _, _, _, _, _, _, _],
        ];
        const state: KamisadoState =
            new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
        const node: KamisadoNode = new KamisadoNode(state);
        // When computing the board value
        // Then the score should be the advantage of zero over one
        expect(minimax.getBoardValue(node).value).toEqual(2);
    });
});
