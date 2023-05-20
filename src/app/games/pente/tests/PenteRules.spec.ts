import { Coord } from "src/app/jscaip/Coord";
import { Minimax } from "src/app/jscaip/Minimax";
import { Player, PlayerOrNone } from "src/app/jscaip/Player";
import { RulesFailure } from "src/app/jscaip/RulesFailure";
import { RulesUtils } from "src/app/jscaip/tests/RulesUtils.spec";
import { PenteMove } from "../PenteMove";
import { PenteNode, PenteRules } from "../PenteRules";
import { PenteState } from "../PenteState";

describe('PenteRules', () => {

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    let rules: PenteRules;
    let minimaxes: Minimax<PenteMove, PenteState>[];

    beforeEach(() => {
        rules = PenteRules.get();
        minimaxes = [
        ];
    });
    it('should allow a drop on an empty space', () => {
        // Given a state
        const state: PenteState = PenteState.getInitialState();

        // When doing a drop on an empty space
        const move: PenteMove = PenteMove.of(new Coord(9, 8));

        // Then it should succeed
        const expectedState: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 0], 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should forbid a drop on an occupied space', () => {
        // Given a state
        const state: PenteState = PenteState.getInitialState();

        // When doing a drop on an occupied space
        const move: PenteMove = PenteMove.of(new Coord(9, 9));

        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
    });
    it('should capture pieces when two opponent pieces are sandwiched', () => {
        // Given a state almost at a sandwich point
        const state: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, X, O, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 0], 3);

        // When doing a drop to make a sandwich
        const move: PenteMove = PenteMove.of(new Coord(9, 6));

        // Then it should make a delicious sandwich
        const expectedState: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 2], 4);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should support multiple captures', () => {
        // Given a state almost at a double sandwich point, aka a triplette
        const state: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, O, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, X, O, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 0], 3);

        // When doing a drop to sandwich twice
        const move: PenteMove = PenteMove.of(new Coord(9, 6));

        // Then it should make the triplette
        const expectedState: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 4], 4);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should be ongoing if there are still available spaces and no victory', () => {
        // Given a state with available spaces and no victory
        const state: PenteState = PenteState.getInitialState();
        const node: PenteNode = new PenteNode(state);
        // Then it should be ongoing
        RulesUtils.expectToBeOngoing(rules, node, minimaxes);
    });
    it('should be a draw if there are no 5-alignments', () => {
        // Given a drawn state
        const state: PenteState = new PenteState([
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [O, O, O, O, X, X, X, X, O, O, O, O, X, X, X, X, O, O, O],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [O, O, O, O, X, X, X, X, O, O, O, O, X, X, X, X, O, O, O],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [O, O, O, O, X, X, X, X, O, O, O, O, X, X, X, X, O, O, O],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [O, O, O, O, X, X, X, X, O, O, O, O, X, X, X, X, O, O, O],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
            [X, X, X, X, O, O, O, O, X, X, X, X, O, O, O, O, X, X, X],
        ], [8, 8], 1337);
        const node: PenteNode = new PenteNode(state);
        // Then it should be a draw
        RulesUtils.expectToBeDraw(rules, node, minimaxes);
    });
    it('should detect 10 captures victory', () => {
        // Given a state with 10 captures from a player
        const state: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, X, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [10, 0], 3);
        const node: PenteNode = new PenteNode(state);
        // Then it should be a victory for this player
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
    it('should detect alignment victory', () => {
        // Given a state where zero has aligned 5
        const state: PenteState = new PenteState([
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, O, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, O, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, X, _, O, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, X, _, _, X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ], [0, 0], 3);
        const node: PenteNode = new PenteNode(state);
        // Then it should be a victory for zero
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, minimaxes);
    });
});
