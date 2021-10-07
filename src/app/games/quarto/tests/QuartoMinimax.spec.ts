import { QuartoPiece } from '../QuartoPiece';
import { QuartoState } from '../QuartoState';
import { QuartoMinimax } from '../QuartoMinimax';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { QuartoNode, QuartoRules } from '../QuartoRules';
import { Table } from 'src/app/utils/ArrayUtils';

describe('QuartoMinimax:', () => {

    let minimax: QuartoMinimax;

    const NULL: QuartoPiece = QuartoPiece.NONE;
    const AAAA: QuartoPiece = QuartoPiece.AAAA;
    const AAAB: QuartoPiece = QuartoPiece.AAAB;
    const AABB: QuartoPiece = QuartoPiece.AABB;
    const ABBB: QuartoPiece = QuartoPiece.ABBB;

    beforeEach(() => {
        const rules: QuartoRules = new QuartoRules(QuartoState);
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
        const node: QuartoNode = new MGPNode(null, null, state);
        expect(minimax.getBoardValue(node).value).toEqual(Number.MAX_SAFE_INTEGER - 1);
    });
});
