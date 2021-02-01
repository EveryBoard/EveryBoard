import { TablutRules } from './TablutRules';
import { TablutMove } from '../tablut-move/TablutMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Orthogonal } from 'src/app/jscaip/DIRECTION';
import { TablutPartSlice } from '../TablutPartSlice';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';
import { TablutCase } from './TablutCase';
import { Player } from 'src/app/jscaip/player/Player';
import { TablutLegalityStatus } from '../TablutLegalityStatus';

describe('TablutRules', () => {
    let rules: TablutRules;
    const _: number = TablutCase.UNOCCUPIED.value;
    const x: number = TablutCase.INVADERS.value;
    const i: number = TablutCase.DEFENDERS.value;
    const A: number = TablutCase.PLAYER_ONE_KING.value;

    beforeAll(() => {
        TablutRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || TablutRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new TablutRules(TablutPartSlice);
    });
    it('TablutRules should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, 'Game should start a turn 0');
    });
    it('TablutRules.getSurroundings should return neighboorings cases', () => {
        const startingBoard: number[][] = rules.node.gamePartSlice.getCopiedBoard();
        const {
            backCoord, back, backInRange,
            leftCoord, left,
            rightCoord, right,
        } = TablutRules.getSurroundings(new Coord(3, 1), Orthogonal.RIGHT, Player.ZERO, startingBoard);
        expect(backCoord).toEqual(new Coord(4, 1));
    });
    it('Capture should work', () => {
        const board: number[][] = [
            [_, A, _, _, _, _, _, _, _],
            [_, x, x, _, _, _, _, _, _],
            [_, _, i, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, A, _, _, _, _, _, _],
            [_, x, _, _, _, _, _, _, _],
            [_, _, i, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 3);
        const move: TablutMove = new TablutMove(new Coord(1, 0), new Coord(2, 0));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 4);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Moving emptyness should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 1), new Coord(1, 1)))).toBeFalse();
    });
    it('Moving ennemy pawn should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(4, 2), new Coord(4, 3)))).toBeFalse();
    });
    it('Landing on pawn should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 3), new Coord(4, 3)))).toBeFalse();
    });
    it('Passing through pawn should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 3), new Coord(5, 3)))).toBeFalse();
    });
    it('Should consider defender winner when all invaders are dead');
    it('Capturing against empty throne should work', () => {
        const board: number[][] = [
            [_, x, _, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, x, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, x, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 3);
        const move: TablutMove = new TablutMove(new Coord(3, 0), new Coord(2, 0));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 4);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Capturing king should require four invader and lead to victory', () => {
        const board: number[][] = [
            [_, _, x, _, _, _, _, _, _],
            [_, _, x, A, x, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, x, _, _, _, _, _],
            [_, _, x, _, x, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 0);
        const move: TablutMove = new TablutMove(new Coord(2, 0), new Coord(3, 0));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = rules.getBoardValue(move, expectedSlice);
        expect(boardValue).toEqual(Number.MIN_SAFE_INTEGER, 'This should be a victory for player 0');
    });
    it('Capturing king should require three invader and an edge lead to victory', () => {
        const board: number[][] = [
            [_, _, x, A, x, _, _, _, _],
            [_, _, x, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, x, _, x, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 0);
        const move: TablutMove = new TablutMove(new Coord(2, 1), new Coord(3, 1));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = rules.getBoardValue(move, expectedSlice);
        expect(boardValue).toEqual(Number.MIN_SAFE_INTEGER, 'This should be a victory for invader.');
    });
    it('Capturing king with two soldier, one throne, and one edge should not work be a victory', () => {
        const board: number[][] = [
            [_, A, x, _, _, _, _, _, _],
            [_, _, x, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, A, x, _, _, _, _, _, _],
            [_, x, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 2);
        const move: TablutMove = new TablutMove(new Coord(2, 1), new Coord(1, 1));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 3);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = rules.getBoardValue(move, expectedSlice);
        expect(boardValue).not.toEqual(Number.MIN_SAFE_INTEGER, 'This should not be a victory.');
    });
    it('Capturing king against a throne should not work', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, x, _, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, x, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 0);
        const move: TablutMove = new TablutMove(new Coord(2, 2), new Coord(4, 2));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = rules.getBoardValue(move, expectedSlice);
        expect(boardValue).not.toEqual(Number.MIN_SAFE_INTEGER, 'This should not be a victory for player 0');
        expect(boardValue).not.toEqual(Number.MAX_SAFE_INTEGER, 'This should not be a victory for player 1');
    });
    it('Capturing king against a throne with 3 soldier should not work', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, x, _, _, _, _, _, _],
            [_, _, _, x, A, x, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, x, _, _, _, _],
            [_, _, _, x, A, x, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 12);
        const move: TablutMove = new TablutMove(new Coord(2, 2), new Coord(4, 2));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 13);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = rules.getBoardValue(move, expectedSlice);
        expect(boardValue).not.toEqual(Number.MIN_SAFE_INTEGER, 'This should not be a victory.');
    });
    it('King should be authorised to come back on the throne', () => {
        const move: TablutMove = new TablutMove(new Coord(4, 3), new Coord(4, 4));
        const board: number[][] = [
            [_, _, x, _, _, _, _, _, _],
            [_, _, x, _, x, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [_, _, _, i, _, i, _, _, _],
            [_, _, _, _, i, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const moveResult: TablutLegalityStatus = TablutRules.tryMove(Player.ONE, move, board);
        expect(moveResult.legal.isSuccess()).toBeTrue();
    });
    it('Should forbid Soldier to land on the throne', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, x, _, _, _, _, _],
            [_, _, _, _, A, _, _, _, _],
            [i, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 1);
        const move: TablutMove = new TablutMove(new Coord(0, 4), new Coord(4, 4));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.getReason()).toBe('Les soldats n\'ont pas le droit de se poser sur le throne.');
    });
});
