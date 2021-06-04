import { QuartoPiece } from '../QuartoPiece';
import { QuartoPartSlice } from '../QuartoPartSlice';
import { QuartoMinimax } from '../QuartoMinimax';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { QuartoRules } from '../QuartoRules';

describe('QuartoMinimax:', () => {
    let minimax: QuartoMinimax;

    const NULL: number = QuartoPiece.NONE.value;
    const AAAA: number = QuartoPiece.AAAA.value;
    const AAAB: number = QuartoPiece.AAAB.value;
    const AABB: number = QuartoPiece.AABB.value;
    const ABBB: number = QuartoPiece.ABBB.value;

    beforeEach(() => {
        const rules: QuartoRules = new QuartoRules(QuartoPartSlice);
        minimax = new QuartoMinimax(rules, 'QuartoMinimax');
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
        expect(minimax.getBoardValue(new MGPNode(null, null, slice)).value).toEqual(Number.MAX_SAFE_INTEGER - 1);
    });
});
