import { TablutRules } from "./TablutRules";
import { TablutMove } from "./TablutMove";
import { Coord } from "src/app/jscaip/Coord";
import { Orthogonale } from "src/app/jscaip/DIRECTION";
import { TablutPartSlice } from "./TablutPartSlice";
import { INCLUDE_VERBOSE_LINE_IN_TEST } from "src/app/app.module";

describe('TablutRules', () => {

    let rules: TablutRules;

    beforeAll(() => {
        TablutRules.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || TablutRules.VERBOSE;
    });
    beforeEach(() => {
        rules = new TablutRules();
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
});