import { Orthogonale } from "src/app/jscaip/DIRECTION";
import { LegalityStatus } from "src/app/jscaip/LegalityStatus";
import { Player } from "src/app/jscaip/Player";
import { QuixoPartSlice } from "../quixo-part-slice/QuixoPartSlice";
import { QuixoMove } from "../QuixoMove";
import { QuixoRules } from "./QuixoRules";

describe("QuixoRules:", () => {

    let rules: QuixoRules;
    let _: number = Player.NONE.value;
    let X: number = Player.ONE.value;
    let O: number = Player.ZERO.value;

    beforeEach(() => {
        rules = new QuixoRules();
    });

    it("Should forbid player to start a move with opponents piece", () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, X],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 0);
        const move: QuixoMove = new QuixoMove(4, 2, Orthogonale.LEFT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeFalsy("Move should be illegal");
    });

    it("Should always put moved piece to currentPlayer symbol", () => {
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
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonale.RIGHT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeTruthy("Move should be legal");
        const resultingSlice: QuixoPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: QuixoPartSlice = new QuixoPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
    });

    it("Should declare winner the player who create a line of his symbol", () => {
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
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonale.RIGHT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeTruthy("Move should be legal");
        const resultingSlice: QuixoPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: QuixoPartSlice = new QuixoPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, expectedSlice)).toEqual(Number.MIN_SAFE_INTEGER, "This should be a victory for player 0");
    });

    it("Should declare looser the player who create a line of his opponent symbol, even if creating a line of his symbol too", () => {
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
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonale.RIGHT);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeTruthy("Move should be legal");
        const resultingSlice: QuixoPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        const expectedSlice: QuixoPartSlice = new QuixoPartSlice(expectedBoard, 1);
        expect(resultingSlice).toEqual(expectedSlice);
        expect(rules.getBoardValue(move, expectedSlice)).toEqual(Number.MAX_SAFE_INTEGER, "This should be a victory for player 1");
    });
});