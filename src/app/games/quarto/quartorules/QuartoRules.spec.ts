import { QuartoRules } from "./QuartoRules";
import { QuartoMove } from "../quartomove/QuartoMove";
import { QuartoEnum } from "../QuartoEnum";
import { INCLUDE_VERBOSE_LINE_IN_TEST } from "src/app/app.module";
import { QuartoPartSlice } from "../QuartoPartSlice";

describe('QuartoRules', () => {

    let rules: QuartoRules;

    beforeAll(() => {
        QuartoRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || QuartoRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new QuartoRules(QuartoPartSlice);
    });
    it('Should create', () => {
        expect(rules).toBeTruthy();
    });
    it('Should allow first move', () => {
        const move: QuartoMove = new QuartoMove(2, 2, QuartoEnum.AAAB);
        const isLegal: boolean = rules.choose(move);
        expect(isLegal).toBeTrue();
    });
    it('Test: Should allow simple move from db', () => {
        const movesFromDB: number[] = [ 107, 166, 69 ];
        for (let encodedMove of movesFromDB) {
            const move: QuartoMove = QuartoMove.decode(encodedMove);
            const isLegal: boolean = rules.choose(move);
            expect(isLegal).toBeTrue();
        }
    });
});