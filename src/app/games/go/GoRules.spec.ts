import {GoRules} from './GoRules';
import { GoMove } from './GoMove';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('GoRules', () => {

    let rules: GoRules;

    beforeAll(() => {
        GoRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(() => {
        rules = new GoRules();
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('simple capture should be legal', () => {
        expect(rules.choose(new GoMove(0, 1))).toEqual(true);
        expect(rules.choose(new GoMove(0, 0))).toEqual(true);
        expect(rules.choose(new GoMove(1, 1))).toEqual(true);
    });
    it('superposition shoud be illegal', () => {
        expect(rules.choose(new GoMove(0, 1))).toEqual(true);
        expect(rules.choose(new GoMove(0, 1))).toEqual(false);
    });
    it('ko shoud be illegal', () => {
        expect(rules.choose(new GoMove(2, 0))).toEqual(true);
        expect(rules.choose(new GoMove(1, 0))).toEqual(true);
        expect(rules.choose(new GoMove(1, 1))).toEqual(true);
        expect(rules.choose(new GoMove(0, 1))).toEqual(true);
        expect(rules.choose(new GoMove(0, 0))).toEqual(true); // Capture creating ko
        expect(rules.choose(new GoMove(1, 0))).toEqual(false); // the illegal ko move
    });
});