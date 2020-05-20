import {GoRules} from './GoRules';
import { GoMove } from './GoMove';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { Phase, GoPartSlice, Pawn } from './GoPartSlice';

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
        expect(rules.choose(new GoMove(0, 1))).toBeTruthy();
        expect(rules.choose(new GoMove(0, 0))).toBeTruthy();
        expect(rules.choose(new GoMove(1, 1))).toBeTruthy();
    });
    it('pass should be always legal', () => {
        expect(rules.choose(GoMove.pass)).toBeTruthy();
    });
    it('superposition should be illegal', () => {
        expect(rules.choose(new GoMove(0, 1))).toBeTruthy();
        expect(rules.choose(new GoMove(0, 1))).toBeFalsy();
    });
    it('ko should be illegal', () => {
        expect(rules.choose(new GoMove(2, 0))).toBeTruthy(0); expect(rules.choose(new GoMove(1, 0))).toBeTruthy(1);
        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(2); expect(rules.choose(new GoMove(0, 1))).toBeTruthy(3);
        expect(rules.choose(new GoMove(0, 0))).toBeTruthy(4); // Capture creating ko
        expect(rules.choose(new GoMove(1, 0))).toBeFalsy(); // the illegal ko move
    });
    it('snap back should be legal', () => {
        expect(rules.choose(new GoMove(2, 4))).toBeTruthy(0); expect(rules.choose(new GoMove(3, 4))).toBeTruthy(1);
        expect(rules.choose(new GoMove(2, 3))).toBeTruthy(2); expect(rules.choose(new GoMove(3, 3))).toBeTruthy(3);
        expect(rules.choose(new GoMove(3, 2))).toBeTruthy(4); expect(rules.choose(GoMove.pass)).toBeTruthy(5);
        expect(rules.choose(new GoMove(4, 2))).toBeTruthy(6); expect(rules.choose(GoMove.pass)).toBeTruthy(7);
        expect(rules.choose(new GoMove(4, 4))).toBeTruthy(8); // Capturable pawn on purpose (snapback)
        expect(rules.choose(new GoMove(4, 3))).toBeTruthy(9); // Capture NOT creating ko
        expect(rules.choose(new GoMove(4, 4))).toBeTruthy('Snapback should be legal'); // Legal snapback
    });
    it('simply shared board should be simple to calculate', () => {
        expect(rules.choose(new GoMove(2, 0))).toBeTruthy(0); expect(rules.choose(new GoMove(3, 0))).toBeTruthy(1);
        expect(rules.choose(new GoMove(2, 1))).toBeTruthy(2); expect(rules.choose(new GoMove(3, 1))).toBeTruthy(3);
        expect(rules.choose(new GoMove(2, 2))).toBeTruthy(4); expect(rules.choose(new GoMove(3, 2))).toBeTruthy(5);
        expect(rules.choose(new GoMove(2, 3))).toBeTruthy(6); expect(rules.choose(new GoMove(3, 3))).toBeTruthy(7);
        expect(rules.choose(new GoMove(2, 4))).toBeTruthy(8); expect(rules.choose(new GoMove(3, 4))).toBeTruthy(9);
        expect(rules.countBoardScore(rules.node.gamePartSlice)).toEqual([10, 5], "Board score should be 10 against 5");
    });
    it('Passing twice should lead to possibility to mark as deads stones', () => {
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PLAYING);
        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(0);
        expect(rules.choose(GoMove.pass)).toBeTruthy(1);
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PASSED);
        expect(rules.choose(GoMove.pass)).toBeTruthy(2);
        const sliceBefore: GoPartSlice = rules.node.gamePartSlice;
        expect(sliceBefore.phase).toBe(Phase.COUNTING);
        expect(sliceBefore.getBoardByXY(1, 1)).toBe(Pawn.BLACK);

        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(3);

        const sliceAfter: GoPartSlice = rules.node.gamePartSlice;
        expect(sliceAfter.getBoardByXY(1, 1)).toBe(Pawn.DEAD_BLACK, "Black piece should have been marked as dead");
    });
});