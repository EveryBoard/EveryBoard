/* eslint-disable max-lines-per-function */
import { Coord } from '../../../../jscaip/Coord';
import { Player } from '../../../../jscaip/Player';
import { BashniRules } from '../../bashni/BashniRules';
import { InternationalCheckersRules } from '../../international-checkers/InternationalCheckersRules';
import { LascaRules } from '../../lasca/LascaRules';
import { AbstractCheckersRules, CheckersConfig, CheckersNode } from '../AbstractCheckersRules';
import { CheckersMove } from '../CheckersMove';
import { CheckersMoveGenerator } from '../CheckersMoveGenerator';
import { CheckersPiece, CheckersStack, CheckersState, EvenCheckersState, OddCheckersState } from '../CheckersState';

const U: CheckersStack = new CheckersStack([CheckersPiece.ZERO]);
const V: CheckersStack = new CheckersStack([CheckersPiece.ONE]);
const O: CheckersStack = new CheckersStack([CheckersPiece.ZERO_PROMOTED]);
const X: CheckersStack = new CheckersStack([CheckersPiece.ONE_PROMOTED]);
const _: CheckersStack = CheckersStack.EMPTY;

const rules: AbstractCheckersRules[] = [
    InternationalCheckersRules.get(),
    LascaRules.get(),
    BashniRules.get(),
];

for (const rule of rules) {

    describe('CheckersMoveGenerator for ' + rule.constructor.name, () => {

        let moveGenerator: CheckersMoveGenerator;
        const defaultConfig: CheckersConfig = rule.getDefaultRulesConfig();

        beforeEach(() => {
            moveGenerator = new CheckersMoveGenerator(rule);
        });

        it('should return full list of steps when no capture must be done', () => {
            // Given a state where only steps can be made
            const state: CheckersState = rule.getInitialState(defaultConfig);
            const node: CheckersNode = new CheckersNode(state);

            // When listing the moves
            const moves: CheckersMove[] = moveGenerator.getListMoves(node, defaultConfig);

            // Then it should return the list of steps
            expect(moves.every((move: CheckersMove) => move.isStep)).toBe(true);
        });

    });

}

describe('CheckersMoveGenerator for International Checkers', () => {

    let moveGenerator: CheckersMoveGenerator;
    const defaultConfig: CheckersConfig = InternationalCheckersRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new CheckersMoveGenerator(InternationalCheckersRules.get());
    });

    it('should only include majoritary capture from list move', () => {
        // Given a state where current player should capture
        const state: CheckersState = OddCheckersState.of([
            [_, _, _, _, _, _, _],
            [_, _, V, _, _, _, _],
            [_, U, _, U, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, U, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ], 1);
        const node: CheckersNode = new CheckersNode(state);

        // When listing the moves
        const moves: CheckersMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should return the list of captures
        expect(moves.length).toBe(1);
    });

    describe('getLegalCaptures', () => {

        it('should forbid to pass over the same piece several times', () => {
            // Given a board with only one possible capture
            const state: CheckersState = OddCheckersState.of([
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, V, _, _, _, _],
                [_, _, _, _, _, _, V, _, V, _],
                [_, _, _, _, _, _, _, _, _, O],
                [_, _, _, _, V, _, V, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _, _],
            ], 20);

            // When checking the legal list of captures
            const legalCaptures: CheckersMove[] = moveGenerator.getLegalCaptures(state, defaultConfig);

            // Then it should be this one, the bigger not to fly over same coord twice
            const coords: Coord[] = [
                new Coord(9, 6),
                new Coord(6, 3),
                new Coord(3, 6),
                new Coord(5, 8),
                new Coord(7, 6),
            ];
            const move: CheckersMove = CheckersMove.fromCapture(coords);
            expect(legalCaptures).toEqual([move]);
        });

    });
});

describe('CheckersMoveGenerator for Lasca', () => {

    let moveGenerator: CheckersMoveGenerator;
    const defaultConfig: CheckersConfig = LascaRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new CheckersMoveGenerator(LascaRules.get());
    });

    it('should include minoritary capture from list move', () => {
        // Given a state where current player should capture
        const state: CheckersState = EvenCheckersState.of([
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, V, _, _, _, _],
            [_, U, _, U, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, U, _],
            [_, _, _, _, _, _, _],
        ], 1);
        const node: CheckersNode = new CheckersNode(state);

        // When listing the moves
        const moves: CheckersMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should return the list of captures
        expect(moves.length).toBe(2);
    });

    describe('getLegalCaptures', () => {

        it('should allow returning to the starting coordinate during a multiple capture', () => {
            // Given an officer that could capture pieces so that it returns to its original position
            const state: CheckersState = EvenCheckersState.of([
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, _, _, _, _],
                [_, _, _, V, _, V, _],
                [_, _, _, _, _, _, O],
                [_, _, _, V, _, V, _],
                [_, _, _, _, _, _, _],
            ], 20);

            // When listing captures that jump over each piece once and return to the starting coordinate
            const legalCaptures: CheckersMove[] = moveGenerator.getLegalCaptures(state, defaultConfig);

            // Then both circular paths should be legal
            const coordsClockwise: Coord[] = [
                new Coord(6, 4),
                new Coord(4, 2),
                new Coord(2, 4),
                new Coord(4, 6),
                new Coord(6, 4),
            ];
            const moveClockwise: CheckersMove = CheckersMove.fromCapture(coordsClockwise);
            const coordsCounterClockwise: Coord[] = [
                new Coord(6, 4),
                new Coord(4, 6),
                new Coord(2, 4),
                new Coord(4, 2),
                new Coord(6, 4),
            ];
            const moveCounterClockwise: CheckersMove = CheckersMove.fromCapture(coordsCounterClockwise);
            expect(legalCaptures).toEqual([moveClockwise, moveCounterClockwise]);
        });

    });

});

describe('CheckersMoveGenerator for Bashni', () => {

    let moveGenerator: CheckersMoveGenerator;
    const bashniRules: BashniRules = BashniRules.get();
    const defaultConfig: CheckersConfig = bashniRules.getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new CheckersMoveGenerator(bashniRules);
    });

    it('should not generate captures that are illegal after mid-capture promotion', () => {
        // Given a board where a man promotes during a capture
        const state: CheckersState = OddCheckersState.of([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, V, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, V, _, V, _],
            [_, _, _, _, _, _, _, _],
            [_, _, V, _, _, _, _, _],
            [_, U, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ], 0);
        const node: CheckersNode = new CheckersNode(state);

        // When listing the generated moves
        const moves: CheckersMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then every generated move should be legal
        expect(moves.every((move: CheckersMove) => bashniRules.isLegal(move, state, defaultConfig).isSuccess()))
            .toBeTrue();
    });

    it('should generate flying captures for a non-current player based on the moving piece owner', () => {
        // Given a board where Player.ONE is not the current player but has a flying capture
        const state: CheckersState = OddCheckersState.of([
            [_, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, U, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ], 0);

        // When listing Player.ONE's captures for heuristic evaluation
        const captures: CheckersMove[] = bashniRules.getCapturesOf(state, Player.ONE, defaultConfig);

        // Then the capture should be generated even though Player.ZERO is the current player
        const expectedMove: CheckersMove = CheckersMove.fromCapture([new Coord(1, 0), new Coord(4, 3)]);
        expect(captures.some((move: CheckersMove) => move.equals(expectedMove))).toBeTrue();
    });

    it('should not generate flying captures over a non-current player own piece', () => {
        // Given a board where Player.ONE's flying king is blocked by another Player.ONE piece
        const state: CheckersState = OddCheckersState.of([
            [_, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, V, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [U, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ], 0);

        // When listing Player.ONE's captures for heuristic evaluation
        const captures: CheckersMove[] = bashniRules.getCapturesOf(state, Player.ONE, defaultConfig);

        // Then no self-capture should be generated
        expect(captures).toEqual([]);
    });

});
