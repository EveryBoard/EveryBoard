import { GoRules } from './GoRules';
import { GoMove } from '../gomove/GoMove';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { Phase, GoPartSlice, Pawn } from '../GoPartSlice';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';

describe('GoRules', () => {

    let rules: GoRules;

    beforeAll(() => {
        GoRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || GoRules.VERBOSE;
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
    it('superposition should be illegal in playing phase', () => {
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
        expect(rules.choose(new GoMove(3, 2))).toBeTruthy(4); expect(rules.choose(GoMove.PASS)).toBeTruthy(5);
        expect(rules.choose(new GoMove(4, 2))).toBeTruthy(6); expect(rules.choose(GoMove.PASS)).toBeTruthy(7);
        expect(rules.choose(new GoMove(4, 4))).toBeTruthy(8); // Capturable pawn on purpose (snapback)
        expect(rules.choose(new GoMove(4, 3))).toBeTruthy(9); // Capture NOT creating ko
        expect(rules.choose(new GoMove(4, 4))).toBeTruthy('Snapback should be legal'); // Legal snapback
    });
    it('Phase.PLAYING + GoMove.PASS = Phase.PASSED', () => {
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PLAYING, "Initial phase should be 'PLAYING'");
        expect(rules.choose(GoMove.PASS)).toBeTruthy("Passing in playing phase should be legal");
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PASSED, "Phase should have been switched to 'PASSED'");
    });
    it('Passing twice should lead to possibility to mark as deads stones', () => {
        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(0); // Playing
        expect(rules.choose(GoMove.PASS)).toBeTruthy(1); // Passed
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PASSED);
        expect(rules.choose(GoMove.PASS)).toBeTruthy(2); // Counting
        const sliceBefore: GoPartSlice = rules.node.gamePartSlice;
        expect(sliceBefore.phase).toBe(Phase.COUNTING, "Phase should have been switched to 'COUNTING'");
        expect(sliceBefore.getBoardByXY(1, 1)).toBe(Pawn.BLACK);

        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(3);

        const sliceAfter: GoPartSlice = rules.node.gamePartSlice;
        expect(sliceAfter.getBoardByXY(1, 1)).toBe(Pawn.DEAD_BLACK, "Black piece should have been marked as dead");
    });
    it('Phase.PASSED + GoMove/play = Phase.PLAYING', () => {
        expect(rules.choose(GoMove.PASS)).toBeTruthy(0);
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PASSED);

        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(1);

        expect(rules.node.gamePartSlice.phase).toBe(Phase.PLAYING, 'Phase should have been switched to PLAYING');
    });
    it('Phase.COUNTING + GoMove/play = Phase.PLAYING', () => {
        expect(rules.choose(GoMove.PASS)).toBeTruthy(0); // Passed
        expect(rules.choose(GoMove.PASS)).toBeTruthy(1); // Counting
        expect(rules.node.gamePartSlice.phase).toBe(Phase.COUNTING);

        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(2); // Playing

        expect(rules.node.gamePartSlice.phase).toBe(Phase.PLAYING, 'Phase should have been switched to PLAYING');
    });
    it('Phase.COUNTING + GoMove/markAsDead = Phase.COUNTING', () => {
        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(0);
        expect(rules.choose(GoMove.PASS)).toBeTruthy(1);
        expect(rules.choose(GoMove.PASS)).toBeTruthy(2);
        expect(rules.node.gamePartSlice.phase).toBe(Phase.COUNTING);

        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(3);

        expect(rules.node.gamePartSlice.phase).toBe(Phase.COUNTING, 'Phase should have been switched to COUNTING');
    });
    it('Phase.COUNTING + GoMove.ACCEPT = Phase.ACCEPT', () => {
        expect(rules.choose(GoMove.PASS)).toBeTruthy(0);
        expect(rules.choose(GoMove.PASS)).toBeTruthy(1);
        expect(rules.node.gamePartSlice.phase).toBe(Phase.COUNTING);

        expect(rules.choose(GoMove.ACCEPT)).toBeTruthy(2);

        expect(rules.node.gamePartSlice.phase).toBe(Phase.ACCEPT, 'Phase should have been switched to ACCEPT');
    });
    it('Phase.ACCEPT + GoMove/play = Phase.PLAYING', () => {
        expect(rules.choose(new GoMove(0, 0))).toBeTruthy(0);
        expect(rules.choose(GoMove.PASS)).toBeTruthy(1);
        expect(rules.choose(GoMove.PASS)).toBeTruthy(2);
        expect(rules.choose(new GoMove(0, 0))).toBeTruthy(3);
        expect(rules.node.gamePartSlice.getBoardByXY(0, 0)).toBe(Pawn.DEAD_BLACK, "Pawn should have been marked as dead");
        expect(rules.choose(GoMove.ACCEPT)).toBeTruthy(4);
        expect(rules.node.gamePartSlice.phase).toBe(Phase.ACCEPT);

        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(5);

        expect(rules.node.gamePartSlice.getBoardByXY(0, 0)).toBe(Pawn.BLACK, "Pawn should have become alive again");
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PLAYING, 'Phase should have been switched to PLAYING');
    });
    it('Phase.ACCEPT + GoMove/markAsDead = Phase.COUNTING', () => {
        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(0); // Playing
        expect(rules.choose(GoMove.PASS)).toBeTruthy(1); // Passed
        expect(rules.choose(GoMove.PASS)).toBeTruthy(2); // Counting
        expect(rules.choose(GoMove.ACCEPT)).toBeTruthy(3); // Accept
        expect(rules.node.gamePartSlice.phase).toBe(Phase.ACCEPT);

        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(4); // Counting

        expect(rules.node.gamePartSlice.phase).toBe(Phase.COUNTING, 'Phase should have been switched to COUNTING');
    });
    it('Phase.ACCEPT + GoMove.ACCEPT = Game Over', () => {
        expect(rules.choose(new GoMove(1, 1))).toBeTruthy(0); // Playing
        expect(rules.choose(GoMove.PASS)).toBeTruthy(1); // Passed
        expect(rules.choose(GoMove.PASS)).toBeTruthy(2); // Counting
        expect(rules.choose(GoMove.ACCEPT)).toBeTruthy(3); // Accept
        expect(rules.node.gamePartSlice.phase).toBe(Phase.ACCEPT);

        expect(rules.choose(GoMove.ACCEPT)).toBeTruthy(4);

        expect(rules.node.isEndGame()).toBeTruthy("Game should be over after two player agreed");
        expect(rules.node.gamePartSlice.phase).toBe(Phase.FINISHED, "Phase should have been switched to 'FINISHED'")
    });
    it('simply shared board should be simple to calculate', () => {
        expect(rules.choose(new GoMove(2, 0))).toBeTruthy(0); expect(rules.choose(new GoMove(3, 0))).toBeTruthy(1);
        expect(rules.choose(new GoMove(2, 1))).toBeTruthy(2); expect(rules.choose(new GoMove(3, 1))).toBeTruthy(3);
        expect(rules.choose(new GoMove(2, 2))).toBeTruthy(4); expect(rules.choose(new GoMove(3, 2))).toBeTruthy(5);
        expect(rules.choose(new GoMove(2, 3))).toBeTruthy(6); expect(rules.choose(new GoMove(3, 3))).toBeTruthy(7);
        expect(rules.choose(new GoMove(2, 4))).toBeTruthy(8); expect(rules.choose(new GoMove(3, 4))).toBeTruthy(9);
        expect(rules.countBoardScore(rules.node.gamePartSlice)).toEqual([10, 5], "Board score should be 10 against 5");
    });
    it('SwitchDeadToScore should be a simple counting method', () => {
        const board: Pawn[][] = GamePartSlice.createBiArray(5, 5, Pawn.EMPTY);
        board[0][0] = Pawn.DEAD_BLACK;
        board[1][1] = Pawn.DEAD_BLACK;
        board[2][2] = Pawn.DEAD_WHITE;
        const captured: number[] = [6, 1];
        const sliceWithDead: GoPartSlice = new GoPartSlice(board, captured, 0, null, Phase.PLAYING);

        const expectedScore: number[] = [7, 3];
        const scorifiedSlice: GoPartSlice = GoRules.switchDeadToScore(sliceWithDead);
        expect(scorifiedSlice.getBoardByXY(0, 0)).toBe(Pawn.EMPTY);
        expect(scorifiedSlice.getBoardByXY(1, 1)).toBe(Pawn.EMPTY);
        expect(scorifiedSlice.getBoardByXY(2, 2)).toBe(Pawn.EMPTY);
        expect(scorifiedSlice.captured).toEqual(expectedScore, "Score should be 7 vs 3")
    });
    it('In count mode, AI should put as dead non capturing stones', () => {
        expect(rules.choose(new GoMove(2, 0))).toBeTruthy(0); expect(rules.choose(new GoMove(3, 0))).toBeTruthy(1);
        expect(rules.choose(new GoMove(2, 1))).toBeTruthy(2); expect(rules.choose(new GoMove(3, 1))).toBeTruthy(3);
        expect(rules.choose(new GoMove(2, 2))).toBeTruthy(4); expect(rules.choose(new GoMove(3, 2))).toBeTruthy(5);
        expect(rules.choose(new GoMove(2, 3))).toBeTruthy(6); expect(rules.choose(new GoMove(3, 3))).toBeTruthy(7);
        expect(rules.choose(new GoMove(2, 4))).toBeTruthy(8); expect(rules.choose(new GoMove(3, 4))).toBeTruthy(9);
        expect(rules.choose(new GoMove(4, 4))).toBeTruthy(10); // incision inside ennemy territory
        expect(rules.choose(new GoMove(4, 1))).toBeTruthy(11); // creating a personnal territory to be considered alive
        expect(rules.choose(GoMove.PASS)).toBeTruthy(12);     expect(rules.choose(GoMove.PASS)).toBeTruthy(13);

        const listMoves: MGPMap<GoMove, GoPartSlice> = rules.getListMoves(rules.node);

        expect(listMoves.size()).toEqual(1, "there should only be one stone to put as dead");
        expect(listMoves.getByIndex(0).key).toEqual(new GoMove(4, 4));
    });
});