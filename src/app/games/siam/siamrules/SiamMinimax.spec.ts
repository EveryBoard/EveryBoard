import { SiamRules, SiamNode } from "./SiamRules";
import { INCLUDE_VERBOSE_LINE_IN_TEST } from "src/app/app.module";
import { SiamPiece } from "../SiamPiece";
import { MNode } from "src/app/jscaip/MNode";
import { SiamPartSlice } from "../SiamPartSlice";
import { SiamMove } from "../siammove/SiamMove";
import { Coord } from "src/app/jscaip/coord/Coord";
import { Orthogonale } from "src/app/jscaip/DIRECTION";
import { MGPOptional } from "src/app/collectionlib/mgpoptional/MGPOptional";

fdescribe("SiamRules - Minimax:", () => {

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
        const bestMove: SiamMove = new SiamMove(3, 1, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
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
        const move: SiamMove = new SiamMove(3, 3, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
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
        const move: SiamMove = new SiamMove(3, 3, MGPOptional.of(Orthogonale.UP), Orthogonale.UP);
        expect(rules.getBoardValue(move, slice)).toBeLessThan(0, "First player should be considered as closer to victory");
    });

    it("at equal 'closestPusher' player who'se turn it is to play should have the advantage", () => {
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, L, M, _],
            [_, _, l, M, _],
            [_, _, _, M, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const move: SiamMove = new SiamMove(1, 2, MGPOptional.of(Orthogonale.RIGHT), Orthogonale.RIGHT);
        const boardValue: number = rules.getBoardValue(move, slice);
        expect(boardValue).toBeLessThan(0);
    });

    it("Should know how far a mountain is from the border", () => {
        console.log("\n\n\nShould know how far a mountain is from the border");
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, U, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const mountain: Coord = new Coord(3, 2);
        const closestPusher: { distance: number, coord: Coord } =
            rules.getDirectionClosestPusher(slice, mountain, Orthogonale.DOWN, 5);
        expect(closestPusher).toEqual({
            distance: 3,
            coord: new Coord(3, 3)
        });
    });

    it("should count rotation as +1 for pushing distance if up-close", () => {
        console.log("\n\n\nshould count rotation as +1 for pushing distance if up-close");
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, L, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const mountain: Coord = new Coord(3, 2);
        const closestPusher: { distance: number, coord: Coord } =
            rules.getDirectionClosestPusher(slice, mountain, Orthogonale.DOWN, 5);
        expect(closestPusher).toEqual({
            distance: 4,
            coord: new Coord(3, 3)
        });
    });

    it("should not count rotation as +1 for pushing distance if not up-close", () => {
        console.log("\n\n\nshould not count rotation as +1 for pushing distance if not up-close");
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, L, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const mountain: Coord = new Coord(3, 2);
        const closestPusher: { distance: number, coord: Coord } =
            rules.getDirectionClosestPusher(slice, mountain, Orthogonale.DOWN, 5);
        expect(closestPusher).toEqual({
            distance: 4,
            coord: new Coord(3, 4)
        });
    });

    it("should count outside pieces", () => {
        console.log("\n\n\nshould count outside pieces");
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, M, M, M, _],
            [_, _, _, _, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const mountain: Coord = new Coord(3, 2);
        const closestPusher: { distance: number, coord: Coord } =
            rules.getDirectionClosestPusher(slice, mountain, Orthogonale.DOWN, 5);
        expect(closestPusher).toEqual({
            distance: 5,
            coord: new Coord(3, 5)
        });
    });

    it("when pusher is out-powered, pusher should not be counted as 'infinite-distance'", () => {
        console.log("\n\n\nwhen pusher is out-powered, pusher should not be counted as 'infinite-distance'");
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, M, M, _],
            [_, _, _, M, _],
            [_, _, _, _, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const mountain: Coord = new Coord(3, 2);
        const closestPushersLocal: { distance: number, coord: Coord } =
            rules.getDirectionClosestPusher(slice, mountain, Orthogonale.DOWN, 5);
        expect(closestPushersLocal).toEqual({
            distance: Number.MAX_SAFE_INTEGER,
            coord: new Coord(3, 5)
        });
    });

    it("when closest pusher is out-powered, furthest pusher should be found", () => {
        console.log("\n\n\nwhen closest pusher is out-powered, furthest pusher should be found");
        const board: number[][] = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, M, M, _],
            [_, _, _, M, _],
            [_, _, _, U, _]
        ];
        const slice: SiamPartSlice = new SiamPartSlice(board, 0);
        const mountain: Coord = new Coord(3, 2);
        const closestPushersLocal: { distance: number, coord: Coord } =
            rules.getDirectionClosestPusher(slice, mountain, Orthogonale.DOWN, 5);
        expect(closestPushersLocal).toEqual({
            distance: 3,
            coord: new Coord(3, 5)
        });
    });

    it("the closer you are from winning, the higher the score", () => {
        expect(false).toBeTruthy("TODO");
    });

    it("unpushable mountain hiding falsly pushable one should not be counted", () => {
        expect(false).toBeTruthy("TODO");
    });
});