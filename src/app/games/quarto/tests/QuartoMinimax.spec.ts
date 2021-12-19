import { QuartoPiece } from '../QuartoPiece';
import { QuartoState } from '../QuartoState';
import { QuartoMinimax } from '../QuartoMinimax';
import { QuartoNode, QuartoRules } from '../QuartoRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { QuartoMove } from '../QuartoMove';

describe('QuartoMinimax:', () => {

    let rules: QuartoRules;
    let minimax: QuartoMinimax;

    const NULL: QuartoPiece = QuartoPiece.NONE;
    const AAAA: QuartoPiece = QuartoPiece.AAAA;
    const AAAB: QuartoPiece = QuartoPiece.AAAB;
    const AABB: QuartoPiece = QuartoPiece.AABB;
    const ABBB: QuartoPiece = QuartoPiece.ABBB;

    beforeEach(() => {
        rules = new QuartoRules(QuartoState);
        minimax = new QuartoMinimax(rules, 'QuartoMinimax');
    });
    it('Should know that the board value is PRE_VICTORY when pieceInHand match board criterion', () => {
        const board: Table<QuartoPiece> = [
            [NULL, ABBB, AABB, AAAB],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const pieceInHand: QuartoPiece = AAAA;
        const state: QuartoState = new QuartoState(board, 3, pieceInHand);
        const node: QuartoNode = new QuartoNode(state);
        expect(minimax.getBoardValue(node).value).toEqual(Number.MAX_SAFE_INTEGER - 1);
    });
    it('Should only propose one move at last turn', () => {
        const board: Table<QuartoPiece> = [
            [QuartoPiece.AABB, QuartoPiece.AAAB, QuartoPiece.ABBA, QuartoPiece.BBAA],
            [QuartoPiece.BBAB, QuartoPiece.BAAA, QuartoPiece.BBBA, QuartoPiece.ABBB],
            [QuartoPiece.BABA, QuartoPiece.BBBB, QuartoPiece.ABAA, QuartoPiece.AABA],
            [QuartoPiece.AAAA, QuartoPiece.ABAB, QuartoPiece.BABB, QuartoPiece.NONE],
        ];
        const state: QuartoState = new QuartoState(board, 15, QuartoPiece.BAAB);
        rules.node = new QuartoNode(state);
        const move: QuartoMove = new QuartoMove(3, 3, QuartoPiece.NONE);
        const possiblesMoves: QuartoMove[] = minimax.getListMoves(rules.node);
        expect(possiblesMoves.length).toBe(1);
        expect(possiblesMoves[0]).toEqual(move);
    });
});
