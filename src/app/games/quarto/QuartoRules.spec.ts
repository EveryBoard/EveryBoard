import { QuartoRules } from "./QuartoRules";
import { QuartoMove } from "./QuartoMove";
import { QuartoEnum } from "./QuartoEnum";

describe('QuartoRules', () => {

    it('Should create', () => {
        const rules: QuartoRules = new QuartoRules();
        expect(rules).toBeTruthy();
    });
    it('Should allow first move', () => {
        const rules: QuartoRules = new QuartoRules();
        const move: QuartoMove = new QuartoMove(2, 2, QuartoEnum.AAAB);
        const isLegal: boolean = rules.choose(move);
        expect(isLegal).toBeTruthy();
    });
});