/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PylosCoord } from '../PylosCoord';
import { PylosMove } from '../PylosMove';
import { PylosState } from '../PylosState';
import { PylosNode, PylosRules } from '../PylosRules';
import { PylosHeuristic, PylosMinimax, PylosMoveGenerator } from '../PylosMinimax';
import { MGPOptional } from 'src/app/utils/MGPOptional';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('PylosMoveGenerator', () => {

    let rules: PylosRules;
    let moveGenerator: PylosMoveGenerator;

    beforeEach(() => {
        rules = PylosRules.get();
        moveGenerator = new PylosMoveGenerator();
    });
    it('should provide 16 drops at first turn', () => {
        const node: PylosNode = rules.getInitialNode();
        expect(moveGenerator.getListMoves(node).length).toBe(16);
    });
    it('should provide drops without capture, drops with one capture, drops with two captures and climbings', () => {
        // Given a board on which all kind of moves are possible
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
        const choices: PylosMove[] = moveGenerator.getListMoves(node);

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
    it('should not include uncapturable pieces in captures', () => {
        // Given a node of a board with a climbing as last move
        const board: PlayerOrNone[][][] = [
            [
                [O, X, X, _],
                [O, O, X, _],
                [O, X, X, _],
                [_, _, _, O],
            ], [
                [O, O, _],
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
        const node: PylosNode = new PylosNode(state);

        // When listing all possibles moves
        const choices: PylosMove[] = moveGenerator.getListMoves(node);

        // Then the minimax should not provide one that capture the startingCoord
        const climbs: PylosMove[] = choices.filter((move: PylosMove) => move.isClimb());
        const uncapturable: PylosCoord = new PylosCoord(1, 1, 0);
        const wrongChoices: PylosMove[] = climbs.filter((move: PylosMove) => {
            return move.startingCoord.equals(move.firstCapture) ||
                   move.startingCoord.equals(move.secondCapture) ||
                   move.firstCapture.equalsValue(uncapturable) ||
                   move.secondCapture.equalsValue(uncapturable);
        });
        expect(wrongChoices.length).toBe(0);
    });
});

describe('PylosHeuristic', () => {

    let heuristic: PylosHeuristic;

    beforeEach(() => {
        heuristic = new PylosHeuristic();
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
        const move: PylosMove = PylosMove.ofDrop(new PylosCoord(2, 2, 1), []);
        const node: PylosNode = new PylosNode(state, MGPOptional.empty(), MGPOptional.of(move));
        expect(heuristic.getBoardValue(node).value).toBe(0);
    });
});

describe('PylosMinimax', () => {
    it('should create', () => {
        expect(new PylosMinimax()).toBeTruthy();
    });
});
