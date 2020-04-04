import { QuartoRules } from "./QuartoRules";
import { QuartoMove } from "./QuartoMove";
import { QuartoEnum } from "./QuartoEnum";
import { INCLUDE_VERBOSE_LINE_IN_TEST } from "src/app/app.module";

describe('QuartoRules', () => {

    let rules: QuartoRules;

    beforeAll(() => {
        QuartoRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(() => {
        rules = new QuartoRules();
    });
    it('Should create', () => {
        expect(rules).toBeTruthy();
    });
    it('Should allow first move', () => {
        const move: QuartoMove = new QuartoMove(2, 2, QuartoEnum.AAAB);
        const isLegal: boolean = rules.choose(move);
        expect(isLegal).toBeTruthy();
    });
});