/* eslint-disable max-lines-per-function */
import { QuartoPiece } from '../QuartoPiece';
import { QuartoState } from '../QuartoState';
import { Table } from 'src/app/utils/ArrayUtils';
import { QuartoMove } from '../QuartoMove';
import { HeuristicUtils } from 'src/app/jscaip/tests/HeuristicUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { QuartoHeuristic } from '../QuartoHeuristic';

describe('QuartoHeuristic', () => {

    let heuristic: QuartoHeuristic;

    const NULL: QuartoPiece = QuartoPiece.EMPTY;
    const AAAA: QuartoPiece = QuartoPiece.AAAA;
    const AAAB: QuartoPiece = QuartoPiece.AAAB;
    const AABB: QuartoPiece = QuartoPiece.AABB;
    const ABBB: QuartoPiece = QuartoPiece.ABBB;

    beforeEach(() => {
        heuristic = new QuartoHeuristic();
    });
    it('should know that the board value is PRE_VICTORY when pieceInHand match board criterion', () => {
        // Given a state with a pre-victory
        const board: Table<QuartoPiece> = [
            [NULL, ABBB, AABB, AAAB],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const pieceInHand: QuartoPiece = AAAA;
        const state: QuartoState = new QuartoState(board, 3, pieceInHand);
        // Then the heuristic should detect the previctory
        HeuristicUtils.expectStateToBePreVictory(state, new QuartoMove(1, 0, AAAA), Player.ONE, [heuristic]);
    });
    it('should recognize "3 3" as pre-victory', () => {
        // Given a board where 3 piece are aligned with a common criterion
        // and another line of 3 matching another criterion
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AAAA, QuartoPiece.ABBB, QuartoPiece.AAAB, QuartoPiece.EMPTY],
            [QuartoPiece.BBBB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
            [QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 10, QuartoPiece.BBBB);

        // When evaluating board value
        // Then it should be evaluated as Ongoing
        const move: QuartoMove = new QuartoMove(0, 0, QuartoPiece.BBBB);
        HeuristicUtils.expectStateToBePreVictory(state, move, Player.ZERO, [heuristic]);
    });
});
