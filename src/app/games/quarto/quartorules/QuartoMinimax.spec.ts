import { QuartoEnum } from "../QuartoEnum";
import { QuartoPartSlice } from "../QuartoPartSlice";
import { QuartoRules } from "./QuartoRules";

describe('QuartoRules - Minimax:', () => {
    let rules: QuartoRules;

    const NULL: number = QuartoEnum.UNOCCUPIED;
    const AAAA: number = QuartoEnum.AAAA;
    const AAAB: number = QuartoEnum.AAAB;
    const AABB: number = QuartoEnum.AABB;
    const ABBB: number = QuartoEnum.ABBB;
    const BAAA: number = QuartoEnum.BAAA;
    const BBAA: number = QuartoEnum.BBAA;
    const BBBA: number = QuartoEnum.BBBA;
    const BBBB: number = QuartoEnum.BBBB;

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
        const pieceInHand: QuartoEnum = AAAA;
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 3, pieceInHand);
        expect(rules.getBoardValue(null, slice)).toEqual(Number.MAX_SAFE_INTEGER - 1);
    });
    it('Should avoid creating 3-3 (avoir creating PRE_VICTORY score status)', () => {
        // To be a good test, there should be one move amongst many who is best
        const board: number[][] = [
            [NULL, ABBB, AAAA, AAAA],
            [NULL, NULL, BAAA, BBBB],
            [NULL, NULL, NULL, NULL],
            [NULL, NULL, NULL, NULL],
        ];
        const pieceInHand: QuartoEnum = AAAA;
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 3, pieceInHand);
        expect(rules.getBoardValue(null, slice)).toEqual(Number.MAX_SAFE_INTEGER - 1);
    });
});