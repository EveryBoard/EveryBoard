import { QuartoPiece } from '../QuartoPiece';
import { QuartoPartSlice } from '../QuartoPartSlice';
import { QuartoRules } from './QuartoRules';

describe('QuartoRules - Minimax:', () => {
    let rules: QuartoRules;

    const NULL: number = QuartoPiece.NONE.value;
    const AAAA: number = QuartoPiece.AAAA.value;
    const AAAB: number = QuartoPiece.AAAB.value;
    const AABB: number = QuartoPiece.AABB.value;
    const ABBB: number = QuartoPiece.ABBB.value;

    beforeEach(() => {
        rules = new QuartoRules(QuartoPartSlice);
    });
    it('Should know that the board value is PRE_VICTORY when pieceInHand match board criteria', () => {
        const board: number[][] = [
            [NULL, ABBB, AABB, AAAB],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const pieceInHand: QuartoPiece = QuartoPiece.fromInt(AAAA);
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 3, pieceInHand);
        expect(rules.getBoardValue(null, slice)).toEqual(Number.MAX_SAFE_INTEGER - 1);
    });
});