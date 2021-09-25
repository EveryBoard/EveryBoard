import { QuartoPiece } from '../QuartoPiece';
import { QuartoState } from '../QuartoState';
import { QuartoMinimax } from '../QuartoMinimax';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { QuartoNode, QuartoRules } from '../QuartoRules';

describe('QuartoMinimax:', () => {
    let minimax: QuartoMinimax;

    const NULL: number = QuartoPiece.NONE.value;
    const AAAA: number = QuartoPiece.AAAA.value;
    const AAAB: number = QuartoPiece.AAAB.value;
    const AABB: number = QuartoPiece.AABB.value;
    const ABBB: number = QuartoPiece.ABBB.value;

    beforeEach(() => {
        const rules: QuartoRules = new QuartoRules(QuartoState);
        minimax = new QuartoMinimax(rules, 'QuartoMinimax');
    });
    it('Should know that the board value is PRE_VICTORY when pieceInHand match board criterion', () => {
        const board: number[][] = [
            [NULL, ABBB, AABB, AAAB],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const pieceInHand: QuartoPiece = QuartoPiece.fromInt(AAAA);
        const state: QuartoState = new QuartoState(board, 3, pieceInHand);
        const node: QuartoNode = new MGPNode(null, null, state);
        expect(minimax.getBoardValue(node).value).toEqual(Number.MAX_SAFE_INTEGER - 1);
    });
});
