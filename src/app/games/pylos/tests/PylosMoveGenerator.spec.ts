/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { PylosCoord } from '../PylosCoord';
import { PylosMove } from '../PylosMove';
import { PylosState } from '../PylosState';
import { PylosNode, PylosRules } from '../PylosRules';
import { PylosMoveGenerator } from '../PylosMoveGenerator';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EmptyRulesConfig } from 'src/app/jscaip/RulesConfigUtil';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('PylosMoveGenerator', () => {

    let rules: PylosRules;
    let moveGenerator: PylosMoveGenerator;
    const defaultConfig: MGPOptional<EmptyRulesConfig> = PylosRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        rules = PylosRules.get();
        moveGenerator = new PylosMoveGenerator();
    });

    it('should provide 16 drops at first turn', () => {
        const node: PylosNode = rules.getInitialNode(MGPOptional.empty());
        expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(16);
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

        // When listing the moves
        const choices: PylosMove[] = moveGenerator.getListMoves(node, defaultConfig);

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

        // When listing the moves
        const choices: PylosMove[] = moveGenerator.getListMoves(node, defaultConfig);

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
