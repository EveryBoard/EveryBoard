/* eslint-disable max-lines-per-function */
import { QuartoPiece } from '../QuartoPiece';
import { QuartoState } from '../QuartoState';
import { QuartoHeuristic, QuartoMinimax, QuartoMoveGenerator } from '../QuartoMinimax';
import { QuartoNode, QuartoRules } from '../QuartoRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { QuartoMove } from '../QuartoMove';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';

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
        RulesUtils.expectStateToBePreVictory(state, new QuartoMove(1, 0, AAAA), Player.ONE, [heuristic]);
    });
});

describe('QuartoMoveGenerator', () => {

    let moveGenerator: QuartoMoveGenerator;

    beforeEach(() => {
        moveGenerator = new QuartoMoveGenerator();
    });
    it('should only propose one move at last turn', () => {
        // Given a board at the last turn
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.EMPTY],
        ];
        const state: QuartoState = new QuartoState(board, 15, QuartoPiece.BAAB);
        const node: QuartoNode = new QuartoNode(state);
        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.EMPTY);
        // When getting the list of moves
        const possibleMoves: QuartoMove[] = moveGenerator.getListMoves(node);
        // Then only one move should be listed
        expect(possibleMoves.length).toBe(1);
        expect(possibleMoves[0]).toEqual(move);
    });
});

describe('QuartoMinimax', () => {
    it('should create', () => {
        expect(new QuartoMinimax()).toBeTruthy();
    });
});
