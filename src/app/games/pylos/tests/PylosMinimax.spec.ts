/* eslint-disable max-lines-per-function */
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { PylosCoord } from '../PylosCoord';
import { PylosMove } from '../PylosMove';
import { PylosState } from '../PylosState';
import { PylosNode, PylosRules } from '../PylosRules';
import { PylosMinimax } from '../PylosMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('PylosMinimax:', () => {

    let rules: PylosRules;
    let minimax: PylosMinimax;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const X: PlayerOrNone = Player.ONE;
    const O: PlayerOrNone = Player.ZERO;

    beforeEach(() => {
        rules = new PylosRules(PylosState);
        minimax = new PylosMinimax(rules, 'PylosMinimax');
    });
    it('Should provide 16 drops at first turn', () => {
        expect(minimax.getListMoves(rules.node).length).toBe(16);
    });
    it('Should provide drops without capture, drops with one capture, drops with two captures and climbings', () => {
        // Given a board on which all kind of moves is possible
        const board: PlayerOrNone[][][] = [
            [
                [X, O, O, _],
                [X, O, _, X],
                [X, X, O, O],
                [X, _, _, _],
            ], [
                [O, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const state: PylosState = new PylosState(board, 0);
        const node: PylosNode = new PylosNode(state);

        // When listing all possibles moves
        const choices: PylosMove[] = minimax.getListMoves(node);

        // Then the minimax should provide them all
        const climbing: number = choices.filter((move: PylosMove) => move.isClimb()).length;
        expect(climbing).toBe(3);
        const captures: PylosMove[] = choices.filter((move: PylosMove) => move.firstCapture.isPresent());
        const dropWithoutCapture: number =
            choices.filter((move: PylosMove) => move.isClimb() === false && move.firstCapture.isAbsent()).length;
        expect(dropWithoutCapture).toBe(5);
        const monoCapture: number = captures.filter((move: PylosMove) => move.secondCapture.isAbsent()).length;
        expect(monoCapture).toBe(5);
        const dualCapture: number = choices.filter((move: PylosMove) => move.secondCapture.isPresent()).length;
        expect(dualCapture).toBe(12);
        expect(choices.length).toBe(climbing + dropWithoutCapture + monoCapture + dualCapture);
    });
    it('should calculate board value according to number of pawn of each player', () => {
        const board: PlayerOrNone[][][] = [
            [
                [O, X, O, X],
                [O, X, O, X],
                [O, X, O, X],
                [O, X, O, X],
            ], [
                [X, _, _],
                [_, O, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];

        const state: PylosState = new PylosState(board, 0);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(2, 2, 1), []);
        expect(minimax.getBoardValue(new PylosNode(state, MGPOptional.empty(), MGPOptional.of(move))).value).toBe(0);
    });
});
