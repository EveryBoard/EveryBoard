import { SiamRules, SiamNode } from "./SiamRules";
import { INCLUDE_VERBOSE_LINE_IN_TEST } from "src/app/app.module";
import { SiamPiece } from "../SiamPiece";
import { MNode } from "src/app/jscaip/MNode";
import { SiamPartSlice } from "../SiamPartSlice";
import { SiamMove } from "../siammove/SiamMove";
import { Coord } from "src/app/jscaip/coord/Coord";
import { Orthogonale } from "src/app/jscaip/DIRECTION";

describe("SiamRules - Minimax:", () => {

    let rules: SiamRules;

    const _: number = SiamPiece.EMPTY.value;
    const M: number = SiamPiece.MOUNTAIN.value;

    const U: number = SiamPiece.WHITE_UP.value;
    const L: number = SiamPiece.WHITE_LEFT.value;
    const R: number = SiamPiece.WHITE_RIGHT.value;
    const D: number = SiamPiece.WHITE_DOWN.value;

    const u: number = SiamPiece.BLACK_UP.value;
    const l: number = SiamPiece.BLACK_LEFT.value;
    const r: number = SiamPiece.BLACK_RIGHT.value;
    const d: number = SiamPiece.BLACK_DOWN.value;

    beforeAll(() => {
        SiamRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || SiamRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new SiamRules();
        MNode.NB_NODE_CREATED = 0;
    });
    it("Should choose victory immediately", () => {
        const board: number[][] = [
            [_, _, _, M, _],
            [_, _, _, U, _],
            [_, M, M, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _]
        ];
        const expectedBoard: number[][] = [
            [_, _, _, U, _],
            [_, _, _, _, _],
            [_, M, M, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const node: SiamNode = new MNode(null, null, slice, 0);
        const bestSon: SiamNode = node.findBestMoveAndSetDepth(1);
        const bestMove: SiamMove = new SiamMove(3, 1, Orthogonale.UP, Orthogonale.UP);
        const expectedSlice: SiamPartSlice = new SiamPartSlice(expectedBoard, 1);
        const expectedSon: SiamNode = new MNode(node, bestMove, expectedSlice, Number.MIN_SAFE_INTEGER);
        expect(bestSon).toEqual(expectedSon);
        expect(node.countDescendants()).toBe(1, "Pre-victory node should only have victory child");
        expect(MNode.NB_NODE_CREATED).toBe(3, "Node under test + Victory Node + expected node should make 3 MNode created");
    });
    it("Should know who is closer to win", () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, M, _],
            [_, M, M, U, _],
            [_, _, u, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(3, 3, Orthogonale.UP, Orthogonale.UP);
        expect(rules.getBoardValue(move, slice)).toBeLessThan(0, "First player should be considered as closer to victory");
    });
    it("Should know who is closer to win", () => {
        const board: number[][] = [
            [_, _, _, M, _],
            [_, _, _, R, _],
            [_, M, M, _, _],
            [_, _, u, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(3, 3, Orthogonale.UP, Orthogonale.UP);
        expect(rules.getBoardValue(move, slice)).toBeLessThan(0, "First player should be considered as closer to victory");
    });
    it("Should know how far a mountain is from the border", () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, U, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const mountain: Coord = new Coord(3, 2);
        const mountainList: Coord[] = [ new Coord(1, 2), new Coord(2, 2), new Coord(3, 2) ];
        const closestPushersLocal: { distance: number, coord: Coord } =
            rules.getDirectionClosestPusher(slice, mountain, Orthogonale.DOWN, 5);
        const closestPusherGlobal: { distance: number, closestPushers: Coord[] } =
            rules.getClosestPushers(slice, mountainList);
        expect(closestPushersLocal).toEqual({ distance: 3, coord: new Coord(3, 3)});
        expect(closestPusherGlobal).toEqual({ distance: 3, closestPushers: [ new Coord(3, 3) ]})
    });
    it("at equal 'closestPusher' player who'se turn it is to play should have the advantage", () => {
        expect(false).toBeTruthy("TODO");
    });
    it("should count quarter-turn as +1 for pushing distance", () => {
        expect(false).toBeTruthy("TODO");
    });
    it("should count half-turn as +2 for pushing distance", () => {
        expect(false).toBeTruthy("TODO");
    });
    it("when something is in the way, pusher should not be counted", () => {
        expect(false).toBeTruthy("TODO");
    });
    it("the closer you are from winning, the higher the score", () => {
        expect(false).toBeTruthy("TODO");
    });
});