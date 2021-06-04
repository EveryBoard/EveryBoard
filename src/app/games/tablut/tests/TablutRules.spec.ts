import { TablutRules } from '../TablutRules';
import { TablutMinimax } from '../TablutMinimax';
import { TablutMove } from '../TablutMove';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { TablutPartSlice } from '../TablutPartSlice';
import { TablutCase } from '../TablutCase';
import { Player } from 'src/app/jscaip/Player';
import { TablutLegalityStatus } from '../TablutLegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';

describe('TablutRules', () => {

    let rules: TablutRules;
    let minimax: TablutMinimax;
    const _: number = TablutCase.UNOCCUPIED.value;
    const x: number = TablutCase.INVADERS.value;
    const i: number = TablutCase.DEFENDERS.value;
    const A: number = TablutCase.PLAYER_ONE_KING.value;

    beforeEach(() => {
        rules = new TablutRules(TablutPartSlice);
        minimax = new TablutMinimax(rules, 'TablutMinimax');
    });
    it('Should be created', () => {
        expect(rules).toBeTruthy();
        expect(rules.node.gamePartSlice.turn).toBe(0, 'Game should start a turn 0');
    });
    describe('getSurroundings', () => {
        it('Should return neighboorings cases', () => {
            const startingBoard: number[][] = rules.node.gamePartSlice.getCopiedBoard();
            const { backCoord } =
                TablutRules.getSurroundings(new Coord(3, 1), Orthogonal.RIGHT, Player.ZERO, startingBoard);
            expect(backCoord).toEqual(new Coord(4, 1));
        });
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
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status);
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
    it('Should consider defender winner when all invaders are dead', () => {
        const board: number[][] = [
            [_, x, _, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, i, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, A, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, i, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 23);
        const move: TablutMove = new TablutMove(new Coord(3, 0), new Coord(2, 0));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 24);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = minimax.getBoardValue(new MGPNode(null, move, expectedSlice)).value;
        expect(boardValue).toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for defender.');
    });
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
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status);
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
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = minimax.getBoardValue(new MGPNode(null, move, expectedSlice)).value;
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
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = minimax.getBoardValue(new MGPNode(null, move, expectedSlice)).value;
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
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 3);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = minimax.getBoardValue(new MGPNode(null, move, expectedSlice)).value;
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
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = minimax.getBoardValue(new MGPNode(null, move, expectedSlice)).value;
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
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 13);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = minimax.getBoardValue(new MGPNode(null, move, expectedSlice)).value;
        expect(boardValue).not.toEqual(Number.MIN_SAFE_INTEGER, 'This should not be a victory for invader.');
        expect(boardValue).not.toEqual(Number.MAX_SAFE_INTEGER, 'This should not be a victory for defender.');
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
    it('Should consider invader winner when all defender are immobilised', () => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [x, _, _, _, _, _, _, _, _],
            [i, x, _, _, _, _, _, _, _],
            [A, _, _, _, _, _, _, _, x],
            [i, x, _, _, _, _, _, _, _],
            [x, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [x, _, _, _, _, _, _, _, _],
            [i, x, _, _, _, _, _, _, _],
            [A, x, _, _, _, _, _, _, _],
            [i, x, _, _, _, _, _, _, _],
            [x, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 24);
        const move: TablutMove = new TablutMove(new Coord(8, 4), new Coord(1, 4));
        const status: TablutLegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: TablutPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: TablutPartSlice = new TablutPartSlice(expectedBoard, 25);
        expect(resultingSlice).toEqual(expectedSlice);
        const boardValue: number = minimax.getBoardValue(new MGPNode(null, move, expectedSlice)).value;
        expect(boardValue).toEqual(Number.MIN_SAFE_INTEGER, 'This should be a victory for invader.');
    });
});
