import {GoRules} from './GoRules';
import {GoMove} from '../gomove/GoMove';
import {INCLUDE_VERBOSE_LINE_IN_TEST} from 'src/app/app.module';
import {Phase, GoPartSlice, GoPiece} from '../GoPartSlice';
import {ArrayUtils} from 'src/app/collectionlib/arrayutils/ArrayUtils';
import {GoLegalityStatus} from '../GoLegalityStatus';
import {Coord} from 'src/app/jscaip/coord/Coord';
import {MGPNode} from 'src/app/jscaip/mgpnode/MGPNode';

describe('GoRules:', () => {
    let rules: GoRules;

    const X: GoPiece = GoPiece.WHITE;
    const O: GoPiece = GoPiece.BLACK;
    const k: GoPiece = GoPiece.DEAD_WHITE;
    const u: GoPiece = GoPiece.DEAD_BLACK;
    const w: GoPiece = GoPiece.WHITE_TERRITORY;
    const b: GoPiece = GoPiece.BLACK_TERRITORY;
    const _: GoPiece = GoPiece.EMPTY;

    beforeAll(() => {
        GoRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || GoRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new GoRules(GoPartSlice);
    });
    it('should be created', () => {
        expect(rules).toBeTruthy();
    });
    it('simple capture should be legal', () => {
        expect(rules.choose(new GoMove(0, 1))).toBeTrue();
        expect(rules.choose(new GoMove(0, 0))).toBeTrue();
        expect(rules.choose(new GoMove(1, 1))).toBeTrue();
    });
    it('complex capture should be legal', () => {
        const board: GoPiece[][] = [
            [_, _, _, _, _],
            [_, _, X, X, _],
            [_, X, O, O, X],
            [_, _, _, O, X],
            [_, _, _, X, _],
        ];
        const expectedBoard: GoPiece[][] = [
            [_, _, _, _, _],
            [_, _, X, X, _],
            [_, X, _, _, X],
            [_, _, X, _, X],
            [_, _, _, X, _],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [0, 0], 1, null, Phase.PLAYING);
        const move: GoMove = new GoMove(2, 3);
        const status: GoLegalityStatus = GoRules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: GoPartSlice = GoRules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: GoPartSlice = new GoPartSlice(expectedBoard, [0, 3], 2, null, Phase.PLAYING);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('superposition should be illegal in playing phase', () => {
        expect(rules.choose(new GoMove(0, 1))).toBeTrue();
        expect(rules.choose(new GoMove(0, 1))).toBeFalse();
    });
    it('ko should be illegal', () => {
        const board: GoPiece[][] = [
            [_, X, O, _, _],
            [X, O, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedBoard: GoPiece[][] = [
            [O, _, O, _, _],
            [X, O, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [0, 0], 0, null, Phase.PLAYING);
        const move: GoMove = new GoMove(0, 0);
        const status: GoLegalityStatus = GoRules.isLegal(move, slice);
        const resultingSlice: GoPartSlice = GoRules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: GoPartSlice = new GoPartSlice(expectedBoard, [1, 0], 1, new Coord(1, 0), Phase.PLAYING);
        expect(resultingSlice).toEqual(expectedSlice, 'resultingSlice');
        expect(GoRules.isLegal(new GoMove(1, 0), resultingSlice).legal.isSuccess()).toBeFalse();
    });
    it('snap back should be legal TODO: Enhance', () => {
        expect(rules.choose(new GoMove(2, 4))).toBeTrue(); expect(rules.choose(new GoMove(3, 4))).toBeTrue();
        expect(rules.choose(new GoMove(2, 3))).toBeTrue(); expect(rules.choose(new GoMove(3, 3))).toBeTrue();
        expect(rules.choose(new GoMove(3, 2))).toBeTrue(); expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.choose(new GoMove(4, 2))).toBeTrue(); expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.choose(new GoMove(4, 4))).toBeTrue(); // Capturable pawn on purpose (snapback)
        expect(rules.choose(new GoMove(4, 3))).toBeTrue(); // Capture NOT creating ko
        expect(rules.choose(new GoMove(4, 4))).toBeTrue(); // Legal snapback
    });
    it('Phase.PLAYING + GoMove.PASS = Phase.PASSED', () => {
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PLAYING, 'Initial phase should be \'PLAYING\'');
        expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PASSED, 'Phase should have been switched to \'PASSED\'');
    });
    it('Phase.PASSED + GoMove/play = Phase.PLAYING', () => {
        expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.node.gamePartSlice.phase).toBe(Phase.PASSED);

        expect(rules.choose(new GoMove(1, 1))).toBeTrue();

        expect(rules.node.gamePartSlice.phase).toBe(Phase.PLAYING, 'Phase should have been switched to PLAYING');
    });
    it('Phase.PASSED + GoMove.PASS = Phase.COUNTING', () => {
        const board: GoPiece[][] = [
            [_, _, O, X, O],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, X],
            [_, _, O, X, _],
        ];
        const expectedBoard: GoPiece[][] = [
            [b, b, O, X, O],
            [b, b, O, X, _],
            [b, b, O, X, _],
            [b, b, O, X, X],
            [b, b, O, X, w],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [0, 0], 0, null, Phase.PASSED);
        const move: GoMove = GoMove.PASS;
        const status: GoLegalityStatus = GoRules.isLegal(move, slice);
        const resultingSlice: GoPartSlice = GoRules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: GoPartSlice = new GoPartSlice(expectedBoard, [10, 1], 1, null, Phase.COUNTING);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Phase.COUNTING + GoMove/markAsDead = Phase.COUNTING (without shared territory)', () => {
        const board: GoPiece[][] = [
            [b, O, X, w, w],
            [b, O, X, w, w],
            [b, O, X, w, w],
            [b, O, X, w, w],
            [b, O, X, w, w],
        ];
        const expectedBoard: GoPiece[][] = [
            [w, u, X, w, w],
            [w, u, X, w, w],
            [w, u, X, w, w],
            [w, u, X, w, w],
            [w, u, X, w, w],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [5, 10], 0, null, Phase.COUNTING);
        const move: GoMove = new GoMove(1, 1);
        const status: GoLegalityStatus = GoRules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: GoPartSlice = GoRules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: GoPartSlice = new GoPartSlice(expectedBoard, [0, 25], 1, null, Phase.COUNTING);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('should markAndCountTerritory correctly, bis', () => {
        const board: GoPiece[][] = [
            [b, O, X, w, w],
            [b, O, X, w, w],
            [b, O, X, w, w],
            [b, O, X, w, w],
            [b, O, X, w, w],
        ];
        const expectedBoard: GoPiece[][] = [
            [b, O, k, b, b],
            [b, O, k, b, b],
            [b, O, k, b, b],
            [b, O, k, b, b],
            [b, O, k, b, b],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [5, 10], 0, null, Phase.COUNTING);
        const move: GoMove = new GoMove(2, 2);
        const status: GoLegalityStatus = GoRules.isLegal(move, slice);
        const resultingSlice: GoPartSlice = GoRules.applyLegalMove(move, slice, status).resultingSlice;
        expect(status.legal.isSuccess()).toBeTrue();
        expect(resultingSlice.getCopiedBoardGoPiece()).toEqual(expectedBoard);
        expect(resultingSlice.getCapturedCopy()).toEqual([25, 0]);
    });
    it('Phase.COUNTING + GoMove/markAsDead = Phase.COUNTING (with shared territory)', () => {
        const board: GoPiece[][] = [
            [b, b, O, X, O],
            [b, b, O, X, _],
            [b, b, O, X, _],
            [b, b, O, X, X],
            [b, b, O, X, w],
        ];
        const expectedBoard: GoPiece[][] = [
            [b, b, O, X, u],
            [b, b, O, X, w],
            [b, b, O, X, w],
            [b, b, O, X, X],
            [b, b, O, X, w],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [10, 1], 0, null, Phase.COUNTING);
        const move: GoMove = new GoMove(4, 0);
        const status: GoLegalityStatus = GoRules.isLegal(move, slice);
        const resultingSlice: GoPartSlice = GoRules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: GoPartSlice = new GoPartSlice(expectedBoard, [10, 5], 1, null, Phase.COUNTING);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Phase.COUNTING + GoMove/play = Phase.PLAYING', () => {
        const board: GoPiece[][] = [
            [b, b, b, b, b],
            [b, b, b, b, b],
            [b, b, b, b, b],
            [b, b, b, b, b],
            [b, b, b, k, O],
        ];
        const expectedBoard: GoPiece[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, X],
            [_, _, _, X, _],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [25, 0], 1, null, Phase.COUNTING);
        const move: GoMove = new GoMove(4, 3);
        const status: GoLegalityStatus = GoRules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: GoPartSlice = GoRules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: GoPartSlice = new GoPartSlice(expectedBoard, [0, 1], 2, null, Phase.PLAYING);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Phase.COUNTING + GoMove.ACCEPT = Phase.ACCEPT', () => {
        expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.node.gamePartSlice.phase).toBe(Phase.COUNTING);

        expect(rules.choose(GoMove.ACCEPT)).toBeTrue();

        expect(rules.node.gamePartSlice.phase).toBe(Phase.ACCEPT, 'Phase should have been switched to ACCEPT');
    });
    it('Phase.ACCEPT + GoMove/play = Phase.PLAYING', () => {
        const board: GoPiece[][] = [
            [b, k, b, O, b],
            [b, k, b, O, b],
            [b, k, b, O, O],
            [O, k, b, O, b],
            [b, k, b, O, b],
        ];
        const expectedBoard: GoPiece[][] = [
            [_, X, _, O, _],
            [_, X, _, O, _],
            [X, X, _, O, O],
            [O, X, _, O, _],
            [_, X, _, O, _],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [23, 0], 1, null, Phase.COUNTING);
        const move: GoMove = new GoMove(0, 2);
        const status: GoLegalityStatus = GoRules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: GoPartSlice = GoRules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: GoPartSlice = new GoPartSlice(expectedBoard, [0, 0], 2, null, Phase.PLAYING);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Phase.ACCEPT + GoMove/play should capture', () => {
        const board: GoPiece[][] = [
            [w, w, w, w, w],
            [w, w, w, w, w],
            [w, w, w, w, X],
            [w, w, w, X, w],
            [w, w, w, X, u],
        ];
        const expectedBoard: GoPiece[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, X],
            [_, _, _, X, X],
            [_, _, _, X, _],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [0, 23], 1, null, Phase.ACCEPT);
        const move: GoMove = new GoMove(4, 3);
        const status: GoLegalityStatus = GoRules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: GoPartSlice = GoRules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: GoPartSlice = new GoPartSlice(expectedBoard, [0, 1], 2, null, Phase.PLAYING);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Phase.ACCEPT + GoMove/markAsDead = Phase.COUNTING', () => {
        expect(rules.choose(new GoMove(1, 1))).toBeTrue(); // Playing
        expect(rules.choose(GoMove.PASS)).toBeTrue(); // Passed
        expect(rules.choose(GoMove.PASS)).toBeTrue(); // Counting
        expect(rules.choose(GoMove.ACCEPT)).toBeTrue(); // Accept
        expect(rules.node.gamePartSlice.phase).toBe(Phase.ACCEPT);

        expect(rules.choose(new GoMove(1, 1))).toBeTrue(); // Counting

        expect(rules.node.gamePartSlice.phase).toBe(Phase.COUNTING, 'Phase should have been switched to COUNTING');
    });
    it('Phase.ACCEPT + GoMove.ACCEPT = Game Over', () => {
        expect(rules.choose(new GoMove(1, 1))).toBeTrue(); // Playing
        expect(rules.choose(GoMove.PASS)).toBeTrue(); // Passed
        expect(rules.choose(GoMove.PASS)).toBeTrue(); // Counting
        expect(rules.choose(GoMove.ACCEPT)).toBeTrue(); // Accept
        expect(rules.node.gamePartSlice.phase).toBe(Phase.ACCEPT);

        expect(rules.choose(GoMove.ACCEPT)).toBeTrue();

        expect(rules.node.isEndGame()).toBeTrue();
        expect(rules.node.gamePartSlice.phase).toBe(Phase.FINISHED, 'Phase should have been switched to \'FINISHED\'');
    });
    it('simply shared board should be simple to calculate', () => {
        const previousBoard: GoPiece[][] = [
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
            [_, _, O, X, _],
        ];
        const expectedBoard: GoPiece[][] = [
            [b, b, O, X, w],
            [b, b, O, X, w],
            [b, b, O, X, w],
            [b, b, O, X, w],
            [b, b, O, X, w],
        ];
        const slice: GoPartSlice = new GoPartSlice(previousBoard, [0, 0], 10, null, Phase.PASSED);
        const move: GoMove = GoMove.PASS;
        const legality: GoLegalityStatus = rules.isLegal(move, slice);
        const resultingSlice: GoPartSlice = rules.applyLegalMove(move, slice, legality).resultingSlice;
        expect(resultingSlice.getCapturedCopy()).toEqual([10, 5], 'Board score should be 10 against 5');
        expect(resultingSlice.getCopiedBoardGoPiece()).toEqual(expectedBoard);
    });
    it('AddDeadToScore should be a simple counting method', () => {
        const board: GoPiece[][] = ArrayUtils.createBiArray(5, 5, GoPiece.EMPTY);
        board[0][0] = GoPiece.DEAD_BLACK;
        board[1][1] = GoPiece.DEAD_BLACK;
        board[2][2] = GoPiece.DEAD_WHITE;
        const captured: number[] = [6, 1];
        const sliceWithDead: GoPartSlice = new GoPartSlice(board, captured, 0, null, Phase.PLAYING);

        const expectedScore: number[] = [7, 3];
        const score: number[] = GoRules.addDeadToScore(sliceWithDead);
        expect(score).toEqual(expectedScore, 'Score should be 7 vs 3');
    });
    it('Should calculate correctly board with dead stones', () => {
        const board: GoPiece[][] = [
            [_, _, X, O, _],
            [_, _, X, O, _],
            [_, _, X, O, X],
            [X, X, X, O, _],
            [_, O, O, O, _],
        ];
        const slice: GoPartSlice = new GoPartSlice(board, [0, 0], 0, null, Phase.PASSED);
        rules.node = new MGPNode(null, null, slice, -6);
        expect(rules.choose(GoMove.PASS)).toBeTrue();
        expect(rules.node.gamePartSlice.phase).toBe(Phase.COUNTING);
        expect(rules.choose(new GoMove(4, 2))).toBeTrue();
        expect(rules.choose(GoMove.ACCEPT)).toBeTrue();
        expect(rules.choose(GoMove.ACCEPT)).toBeTrue();
        expect(rules.getBoardValue(rules.node.move, rules.node.gamePartSlice)).toBe(0);
    });
});
