import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { PylosCoord } from '../PylosCoord';
import { PylosMove } from '../PylosMove';
import { PylosPartSlice } from '../PylosPartSlice';
import { PylosNode, PylosRules } from '../PylosRules';

describe('PylosRules - Minimax:', () => {
    let rules: PylosRules;

    const _: number = Player.NONE.value;

    const X: number = Player.ONE.value;

    const O: number = Player.ZERO.value;

    beforeEach(() => {
        rules = new PylosRules(PylosPartSlice);
    });

    it('Should provide 16 drops at first turn', () => {
        expect(rules.getListMoves(rules.node).listKeys().length).toBe(16);
    });

    it('Should provide 7 drops without capture, 6 drops with one capture, 15 drops with two capture, 3 climbing', () => {
        const board: number[][][] = [
            [
                [X, O, O, _],
                [X, O, _, X],
                [X, _, O, O],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const slice: PylosPartSlice = new PylosPartSlice(board, 0);
        const node: PylosNode = new MGPNode(null, null, slice, 0);
        expect(rules.getListMoves(node).listKeys().length).toBe(31);
    });

    it('should calculate board value according to number of pawn of each player', () => {
        const board: number[][][] = [
            [
                [O, X, O, X],
                [O, X, O, X],
                [O, X, O, X],
                [O, X, O, X],
            ], [
                [X, _, _],
                [_, 0, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const slice: PylosPartSlice = new PylosPartSlice(board, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(2, 2, 1), []);
        expect(rules.getBoardValue(move, slice)).toBe(0);
    });
});
