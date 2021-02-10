import { INCLUDE_VERBOSE_LINE_IN_TEST } from "src/app/app.module";
import { Coord } from "src/app/jscaip/coord/Coord";
import { MGPNode } from "src/app/jscaip/mgp-node/MGPNode";
import { TablutMove } from "../tablut-move/TablutMove";
import { TablutPartSlice } from "../TablutPartSlice";
import { TablutCase } from "./TablutCase";
import { TablutNode, TablutRules } from "./TablutRules";

describe('TablutRules - Minimax:', () => {
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
    it('Should try to make the king escape when it can', () => {
        const board: number[][] = [
            [_, _, x, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, i, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const winnerBoard: number[][] = [
            [_, _, x, _, _, _, _, _, A],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, i, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const slice: TablutPartSlice = new TablutPartSlice(board, 1);
        rules.node = new MGPNode(null, null, slice, 0);
        const winnerMove: TablutMove = new TablutMove(new Coord(3, 0), new Coord(8, 0));
        const winnerSlice: TablutPartSlice = new TablutPartSlice(winnerBoard, 2);

        const bestMove: TablutNode = rules.node.findBestMoveAndSetDepth(1);
        expect(bestMove.move.toString()).toEqual(winnerMove.toString());
        expect(bestMove.gamePartSlice).toEqual(winnerSlice);
    });
});