import { Orthogonale } from "src/app/jscaip/DIRECTION";
import { Player } from "src/app/jscaip/Player";
import { QuixoPartSlice } from "../quixo-part-slice/QuixoPartSlice";
import { QuixoMove } from "../QuixoMove";
import { QuixoRules } from "./QuixoRules";

describe('QuixoMinimax:', () => {

    let rules: QuixoRules;
    let _: number = Player.NONE.value;
    let X: number = Player.ONE.value;
    let O: number = Player.ZERO.value;

    beforeEach(() => {
        rules = new QuixoRules();
    });

    it("Should calcule board value according to longest line differences", () => {
        const board: number[][] = [
            [X, _, _, _, O],
            [X, _, _, _, O],
            [_, _, _, _, _],
            [_, _, _, _, O],
            [X, _, _, _, O],
        ];
        const slice: QuixoPartSlice = new QuixoPartSlice(board, 0);
        const move: QuixoMove = new QuixoMove(0, 2, Orthogonale.RIGHT);
        expect(rules.getBoardValue(move, slice)).toEqual(-1);
    });
});