import { Orthogonal } from 'src/app/jscaip/Direction';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { QuixoPartSlice } from '../QuixoPartSlice';
import { QuixoMove } from '../QuixoMove';
import { QuixoRules } from '../QuixoRules';
import { QuixoMinimax } from "../QuixoMinimax";
import { Coord } from 'src/app/jscaip/Coord';

describe('QuixoRules:', () => {

    let rules: QuixoRules;
    let minimax: QuixoMinimax;
    const _: number = Player.NONE.value;
    const X: number = Player.ONE.value;
    const O: number = Player.ZERO.value;

    beforeEach(() => {
        rules = new QuixoRules(QuixoPartSlice);
        minimax = new QuixoMinimax('QuixoMinimax');
    });
    it('Should forbid player to start a move with opponents piece', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 0);
        const move: QuixoMove = new QuixoMove(4, 2, Orthogonal.LEFT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeFalse();
    });
    it('Should always put moved piece to currentPlayer symbol', () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, O],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: QuixoPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: QuixoPartSlice = new QuixoPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });
    it('Should declare winner player zero when he create a line of his symbol', () => {
        const board: number[][] = [
            [_, _, _, _, O],
            [_, _, _, _, O],
            [_, _, _, _, _],
            [_, _, _, _, O],
            [_, _, _, _, O],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, O],
            [_, _, _, _, O],
            [_, _, _, _, O],
            [_, _, _, _, O],
            [_, _, _, _, O],
        ];
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: QuixoPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: QuixoPartSlice = new QuixoPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(minimax.getBoardValue(move, expectedSlice).value)
            .toEqual(Number.MIN_SAFE_INTEGER, 'This should be a victory for player 0');
    });
    it('Should declare winner player one when he create a line of his symbol', () => {
        const board: number[][] = [
            [_, _, _, _, X],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, X],
        ];
        const expectedBoard: number[][] = [
            [_, _, _, _, X],
            [_, _, _, _, X],
            [_, _, _, _, X],
            [_, _, _, _, X],
            [_, _, _, _, X],
        ];
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 1);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: QuixoPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: QuixoPartSlice = new QuixoPartSlice(expectedBoard, 2);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(minimax.getBoardValue(move, expectedSlice).value)
            .toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for player 1');
    });
    it('Should declare looser player zero who create a line of his opponent symbol, even if creating a line of his symbol too', () => {
        const board: number[][] = [
            [X, _, _, _, O],
            [X, _, _, _, O],
            [_, X, _, _, _],
            [X, _, _, _, O],
            [X, _, _, _, O],
        ];
        const expectedBoard: number[][] = [
            [X, _, _, _, O],
            [X, _, _, _, O],
            [X, _, _, _, O],
            [X, _, _, _, O],
            [X, _, _, _, O],
        ];
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: QuixoPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: QuixoPartSlice = new QuixoPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(minimax.getBoardValue(move, expectedSlice).value)
            .toEqual(Number.MAX_SAFE_INTEGER, 'This should be a victory for player 1');
    });
    it('Should declare looser player one who create a line of his opponent symbol, even if creating a line of his symbol too', () => {
        const board: number[][] = [
            [O, _, _, _, X],
            [O, _, _, _, X],
            [_, O, _, _, _],
            [O, _, _, _, X],
            [O, _, _, _, X],
        ];
        const expectedBoard: number[][] = [
            [O, _, _, _, X],
            [O, _, _, _, X],
            [O, _, _, _, X],
            [O, _, _, _, X],
            [O, _, _, _, X],
        ];
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 1);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonal.RIGHT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal.isSuccess()).toBeTrue();
        const resultingSlice: QuixoPartSlice = rules.applyLegalMove(move, slice, status);
        const expectedSlice: QuixoPartSlice = new QuixoPartSlice(expectedBoard, 2);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(minimax.getBoardValue(move, expectedSlice).value)
            .toEqual(Number.MIN_SAFE_INTEGER, 'This should be a victory for player 0');
    });
    describe('getVictoriousCoords', () => {
        it('should return victorious column', () => {
            const board: number[][] = [
                [O, _, _, _, X],
                [O, _, _, _, X],
                [O, _, _, _, _],
                [O, _, _, _, X],
                [O, _, _, _, X],
            ];
            const slice: QuixoPartSlice = new QuixoPartSlice(board, 1);
            expect(QuixoRules.getVictoriousCoords(slice))
                .toEqual([new Coord(0, 0), new Coord(0, 1), new Coord(0, 2), new Coord(0, 3), new Coord(0, 4)]);
        });
        it('should return victorious row', () => {
            const board: number[][] = [
                [O, O, O, O, O],
                [_, _, _, _, X],
                [_, _, _, _, _],
                [_, _, _, _, X],
                [_, _, _, _, X],
            ];
            const slice: QuixoPartSlice = new QuixoPartSlice(board, 1);
            expect(QuixoRules.getVictoriousCoords(slice))
                .toEqual([new Coord(0, 0), new Coord(1, 0), new Coord(2, 0), new Coord(3, 0), new Coord(4, 0)]);
        });
        it('should return victorious first diagonal', () => {
            const board: number[][] = [
                [O, _, _, _, _],
                [_, O, _, _, _],
                [_, _, O, _, _],
                [_, _, _, O, _],
                [_, _, _, _, O],
            ];
            const slice: QuixoPartSlice = new QuixoPartSlice(board, 1);
            expect(QuixoRules.getVictoriousCoords(slice))
                .toEqual([new Coord(0, 0), new Coord(1, 1), new Coord(2, 2), new Coord(3, 3), new Coord(4, 4)]);
        });
        it('should return victorious second diagonal', () => {
            const board: number[][] = [
                [_, _, _, _, O],
                [_, _, _, O, _],
                [_, _, O, _, _],
                [_, O, _, _, _],
                [O, _, _, _, _],
            ];
            const slice: QuixoPartSlice = new QuixoPartSlice(board, 1);
            expect(QuixoRules.getVictoriousCoords(slice))
                .toEqual([new Coord(0, 4), new Coord(1, 3), new Coord(2, 2), new Coord(3, 1), new Coord(4, 0)]);
        });
    });
});
