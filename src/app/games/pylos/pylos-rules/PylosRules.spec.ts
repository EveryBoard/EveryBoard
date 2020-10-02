import { LegalityStatus } from "src/app/jscaip/LegalityStatus";
import { Player } from "src/app/jscaip/Player";
import { PylosCoord } from "../pylos-coord/PylosCoord";
import { PylosMove } from "../pylos-move/PylosMove";
import { PylosPartSlice } from "../pylos-part-slice/PylosPartSlice";
import { PylosRules } from "./PylosRules";

describe("PylosRules:", () => {

    let rules: PylosRules;

    let _: number = Player.NONE.value;

    let X: number = Player.ONE.value;

    let O: number = Player.ZERO.value;

    beforeEach(() => {
        rules = new PylosRules();
    });

    it("should forbid move who'se landing coord is not empty", () => {
        const board0: number[][] = [
            [O, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
        ]; const board1: number[][] = [
            [_, _, _],
            [_, _, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;

        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeFalsy("Move should be illegal");
    });

    it("should forbid move who'se starting coord is not a player's piece", () => {
        const board0: number[][] = [
            [_, _, _, _],
            [_, _, _, _],
            [_, _, O, X],
            [_, _, X, O],
        ]; const board1: number[][] = [
            [_, _, _],
            [_, _, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;

        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);
        const move: PylosMove = PylosMove.fromMove(new PylosCoord(0, 0, 0), new PylosCoord(2, 2, 1), []);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeFalsy("Move should be illegal");
    });

    it("should forbid move who'se landing coord is not landable (not on the floor, not over 4 lower pieces)", () => {
        const board0: number[][] = [
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
        ]; const board1: number[][] = [
            [_, _, _],
            [_, _, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;

        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 1), []);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeFalsy("Move should be illegal");
    });

    it("should forbid move who capture without having formed a squared", () => {
        const board0: number[][] = [
            [O, _, _, _],
            [_, _, _, _],
            [_, _, _, _],
            [_, _, _, O],
        ]; const board1: number[][] = [
            [_, _, _],
            [_, _, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;

        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 3, 0), [new PylosCoord(0, 0, 0), new PylosCoord(3, 3, 0)]);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeFalsy("Move should be illegal");
    });

    it("should forbid move who capture non-player piece or supporting-piece", () => {
        const board0: number[][] = [
            [_, O, O, _],
            [O, O, X, _],
            [_, _, _, _],
            [_, _, _, _],
        ]; const board1: number[][] = [
            [_, O, _],
            [_, _, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;
        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);

        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), [new PylosCoord(2, 2, 0)]);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeFalsy("Move should be illegal, capturing empty case");

        const otherMove: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), [new PylosCoord(1, 0, 0)]);
        const otherStatus: LegalityStatus = rules.isLegal(otherMove, slice);
        expect(otherStatus.legal).toBeFalsy("Move should be illegal, capturing supporter");
    });

    it("should allow legal capture to include landing piece", () => {
        const board0: number[][] = [
            [_, O, _, _],
            [O, O, _, _],
            [_, _, _, _],
            [_, _, _, _],
        ]; const board1: number[][] = [
            [_, _, _],
            [_, _, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;

        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), [new PylosCoord(0, 0, 0)]);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeTruthy("Move should be legal");
    });

    it("should forbid piece to climb over itself", () => {
        const board0: number[][] = [
            [X, O, _, _],
            [O, O, _, _],
            [_, _, _, _],
            [_, _, _, _],
        ]; const board1: number[][] = [
            [_, _, _],
            [_, _, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;

        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);
        const move: PylosMove = PylosMove.fromMove(new PylosCoord(1, 1, 0), new PylosCoord(0, 0, 1), []);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeFalsy("Move should be illegal");
    });

    it("should forbid piece to climb when supporting", () => {
        const board0: number[][] = [
            [X, O, _, _],
            [O, O, _, _],
            [X, X, _, _],
            [_, _, _, _],
        ]; const board1: number[][] = [
            [O, _, _],
            [_, _, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;

        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);
        const move: PylosMove = PylosMove.fromMove(new PylosCoord(1, 0, 0), new PylosCoord(0, 1, 1), []);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeFalsy("Move should be illegal");
    });

    it("should allow legal capture to include piece supporting previously captured stone", () => {
        const board0: number[][] = [
            [_, O, X, _],
            [O, O, X, _],
            [_, _, _, _],
            [_, _, _, _],
        ]; const board1: number[][] = [
            [_, O, _],
            [_, _, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;

        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), [new PylosCoord(1, 0, 1), new PylosCoord(1, 0, 0)]);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeTruthy("Move should be legal");
    });

    it("should declare looser the first player to put his 15th ball", () => {
        const board0: number[][] = [
            [X, O, X, O],
            [O, O, O, O],
            [X, O, X, O],
            [O, O, O, O],
        ]; const board1: number[][] = [
            [O, _, _],
            [_, O, _],
            [_, _, _],
        ]; const board2: number[][] = [
            [_, _],
            [_, _],
        ]; const board3: number = _;

        const slice: PylosPartSlice = new PylosPartSlice(board0, board1, board2, board3, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(2, 2, 1), []);
        const status: LegalityStatus = rules.isLegal(move, slice);
        expect(status.legal).toBeTruthy("Move should be legal");
        const resultingSlice: PylosPartSlice = rules.applyLegalMove(move, slice, status).resultingSlice;
        expect(rules.getBoardValue(move, resultingSlice)).toBe(Number.MAX_SAFE_INTEGER);
    });
});