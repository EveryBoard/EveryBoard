import { TablutRules } from "./TablutRules";
import { TablutMove } from "../tablutmove/TablutMove";
import { Coord } from "src/app/jscaip/coord/Coord";
import { Orthogonale } from "src/app/jscaip/DIRECTION";
import { TablutPartSlice } from "../TablutPartSlice";
import { INCLUDE_VERBOSE_LINE_IN_TEST } from "src/app/app.module";
import { TablutCase } from "./TablutCase";

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
        expect(rules.node.gamePartSlice.turn).toBe(0, "Game should start a turn 0");
    });
    it('TablutRules.getSurroundings should return neighboorings cases', () => {
        const startingBoard: number[][] = TablutPartSlice.getStartingBoard(true);
        const {
            backCoord,  back, backInRange,
            leftCoord,  left,
            rightCoord, right
        } = TablutRules.getSurroundings(new Coord(3, 1), Orthogonale.RIGHT, 0, true, startingBoard);
        expect(backCoord).toEqual(new Coord(4, 1));
    });
    it('TablutRules.applyLegalMove should apply legal simple move', () => {
        const move: TablutMove = new TablutMove(new Coord(4, 1), new Coord(0, 1));
        const isLegal: boolean = rules.choose(move);
        expect(isLegal).toBeTruthy('Simple first move from invader should be legal');
    });
    it('Quicker capture should work', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 3), new Coord(2, 3)))).toBeTruthy(0);
        expect(rules.choose(new TablutMove(new Coord(4, 2), new Coord(2, 2)))).toBeTruthy(1);
        expect(rules.node.gamePartSlice.getBoardByXY(2, 3)).toEqual(TablutCase.UNOCCUPIED.value, "Location should be unoccupied");
    });
    it('Moving emptyness should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 1), new Coord(1, 1)))).toBeFalsy();
    });
    it('Moving ennemy pawn should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(4, 2), new Coord(4, 3)))).toBeFalsy();
    });
    it('Landing on pawn should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 3), new Coord(4, 3)))).toBeFalsy();
    });
    it('Passing through pawn should be illegal', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 3), new Coord(5, 3)))).toBeFalsy();
    });
    it('Capturing against empty throne should work', () => {
        expect(rules.choose(new TablutMove(new Coord(0, 3), new Coord(3, 3)))).toBeTruthy(0); // Stupid attack
        expect(rules.choose(new TablutMove(new Coord(2, 4), new Coord(2, 3)))).toBeTruthy(1); // resulting capture
        expect(rules.choose(new TablutMove(new Coord(3, 0), new Coord(3, 1)))).toBeTruthy(2); // "pass"
        expect(rules.choose(new TablutMove(new Coord(3, 4), new Coord(3, 7)))).toBeTruthy(3); // leaving a exit for the king
        expect(rules.choose(new TablutMove(new Coord(0, 5), new Coord(0, 6)))).toBeTruthy(4); // "pass"
        expect(rules.choose(new TablutMove(new Coord(4, 4), new Coord(2, 4)))).toBeTruthy(5); // emptying the throne
        expect(rules.choose(new TablutMove(new Coord(0, 6), new Coord(0, 7)))).toBeTruthy(6); // "pass"
        expect(rules.choose(new TablutMove(new Coord(2, 4), new Coord(2, 6)))).toBeTruthy(7);
        // the king leaving the coord that will allow him to capture later
        expect(rules.choose(new TablutMove(new Coord(1, 4), new Coord(4, 4))))
              .toBeFalsy("should impossible to step on the throne for ennemy");
        expect(rules.choose(new TablutMove(new Coord(1, 4), new Coord(3, 4)))).toBeTruthy(8); // going right against the empty throne
        expect(rules.choose(new TablutMove(new Coord(2, 6), new Coord(2, 4)))).toBeTruthy(9); // King capture against empty throne
        expect(rules.node.gamePartSlice.getBoardByXY(3, 4)).toEqual(TablutCase.UNOCCUPIED.value, "Location should be unoccupied");
    });
    it('Capturing king should require four invader and lead to victory', () => {
        const winningMove: TablutMove = new TablutMove(new Coord(2, 0), new Coord(3, 0));
        const board: number[][] = [
            [_, _, x, _, _, _, _, _, _ ],
            [_, _, x, A, x, _, _, _, _ ],
            [_, _, _, x, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ]
        ];
        const moveResult: { success: number; resultingBoard: number[][] } =
            TablutRules.tryMove(0, true, winningMove, board);
        expect(moveResult.success).toBe(TablutRules.SUCCESS);
        expect(TablutRules.getBoardValue(moveResult.resultingBoard, true)).toBe(Number.MIN_SAFE_INTEGER);
    });
    it('Capturing king should require three invader and an edge lead to victory', () => {
        const winningMove: TablutMove = new TablutMove(new Coord(2, 1), new Coord(3, 1));
        const board: number[][] = [
            [_, _, x, A, x, _, _, _, _ ],
            [_, _, x, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ]
        ];
        const moveResult: { success: number; resultingBoard: number[][] } =
            TablutRules.tryMove(0, true, winningMove, board);
        expect(moveResult.success).toBe(TablutRules.SUCCESS);
        expect(TablutRules.getBoardValue(moveResult.resultingBoard, true)).toBe(Number.MIN_SAFE_INTEGER);
    });
    it('Capturing king with two soldier, one throne, and one edge should not work', () => {
        const winningMove: TablutMove = new TablutMove(new Coord(2, 1), new Coord(1, 1));
        const board: number[][] = [
            [_, A, x, _, _, _, _, _, _ ],
            [_, _, x, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ]
        ];
        const moveResult: { success: number; resultingBoard: number[][] } =
            TablutRules.tryMove(0, true, winningMove, board);
        expect(moveResult.success).toBe(TablutRules.SUCCESS);
        expect(TablutRules.getBoardValue(moveResult.resultingBoard, true)).not.toBe(Number.MIN_SAFE_INTEGER);
    });
    it('Capturing king against a throne should not work', () => {
        const winningMove: TablutMove = new TablutMove(new Coord(2, 2), new Coord(4, 2));
        const board: number[][] = [
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, x, _, _, _, _, _, _ ],
            [_, _, _, _, A, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ]
        ];
        const moveResult: { success: number; resultingBoard: number[][] } =
            TablutRules.tryMove(0, true, winningMove, board);
        expect(moveResult.success).toBe(TablutRules.SUCCESS);
        expect(TablutRules.getBoardValue(moveResult.resultingBoard, true)).not.toBe(Number.MIN_SAFE_INTEGER);
    });
    it('Capturing king against a throne with 3 soldier should not work', () => {
        const winningMove: TablutMove = new TablutMove(new Coord(2, 2), new Coord(4, 2));
        const board: number[][] = [
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, x, _, _, _, _, _, _ ],
            [_, _, _, x, A, x, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ]
        ];
        const moveResult: { success: number; resultingBoard: number[][] } =
            TablutRules.tryMove(0, true, winningMove, board);
        expect(moveResult.success).toBe(TablutRules.SUCCESS);
        expect(TablutRules.getBoardValue(moveResult.resultingBoard, true)).not.toBe(Number.MIN_SAFE_INTEGER);
    });
    it('King should be authorised to come back on the throne', () => {
        const move: TablutMove = new TablutMove(new Coord(4, 3), new Coord(4, 4));
        const board: number[][] = [
            [_, _, x, _, _, _, _, _, _ ],
            [_, _, x, _, x, _, _, _, _ ],
            [_, _, _, x, _, _, _, _, _ ],
            [_, _, _, _, A, _, _, _, _ ],
            [_, _, _, i, _, i, _, _, _ ],
            [_, _, _, _, i, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ],
            [_, _, _, _, _, _, _, _, _ ]
        ];
        const moveResult: { success: number; resultingBoard: number[][] } =
            TablutRules.tryMove(1, false, move, board);
        expect(moveResult.success).toBe(TablutRules.SUCCESS);
    });
});