import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { DiaballikMove } from '../DiaballikMove';
import { DiaballikFailure, DiaballikNode, DiaballikRules } from '../DiaballikRules';
import { DiaballikPiece, DiaballikState } from '../DiaballikState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Coord } from 'src/app/jscaip/Coord';
import { MoveCoordToCoord } from 'src/app/jscaip/MoveCoordToCoord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player } from 'src/app/jscaip/Player';

fdescribe('DiaballikRules', () => {

    let rules: DiaballikRules;

    const O: DiaballikPiece = DiaballikPiece.ZERO;
    const Ȯ: DiaballikPiece = DiaballikPiece.ZERO_WITH_BALL;
    const X: DiaballikPiece = DiaballikPiece.ONE;
    const Ẋ: DiaballikPiece = DiaballikPiece.ONE_WITH_BALL;
    const _: DiaballikPiece = DiaballikPiece.NONE;
    beforeEach(() => {
        rules = DiaballikRules.get();
    });
    it('should allow full move with two translations of the same piece and one pass', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When doing a move containing two legal translations of the same piece and one pass
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.of(new MoveCoordToCoord(new Coord(1, 0), new Coord(1, 1))),
                               MGPOptional.of(new MoveCoordToCoord(new Coord(1, 1), new Coord(1, 2))),
                               MGPOptional.of(new MoveCoordToCoord(new Coord(3, 0), new Coord(1, 2)))).get();

        // Then it should succeed
        const expectedState: DiaballikState = new DiaballikState([
            [O, _, O, O, O, O, O],
            [_, _, _, _, _, _, _],
            [_, Ȯ, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, Ẋ, X, X, X],
        ], 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow move with two translations of different pieces', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When doing a move containing two legal translations of different pieces and one pass
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.of(new MoveCoordToCoord(new Coord(1, 0), new Coord(1, 1))),
                               MGPOptional.of(new MoveCoordToCoord(new Coord(0, 0), new Coord(0, 1))),
                               MGPOptional.of(new MoveCoordToCoord(new Coord(3, 0), new Coord(2, 0)))).get();

        // Then it should succeed
        const expectedState: DiaballikState = new DiaballikState([
            [_, _, Ȯ, O, O, O, O],
            [O, O, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, Ẋ, X, X, X],
        ], 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow move with one translation and one pass', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When doing a move containing one translation and one pass
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.of(new MoveCoordToCoord(new Coord(1, 0), new Coord(1, 1))),
                               MGPOptional.of(new MoveCoordToCoord(new Coord(0, 0), new Coord(0, 1))),
                               MGPOptional.of(new MoveCoordToCoord(new Coord(3, 0), new Coord(2, 0)))).get();

        // Then it should succeed
        const expectedState: DiaballikState = new DiaballikState([
            [_, _, Ȯ, O, O, O, O],
            [O, O, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, Ẋ, X, X, X],
        ], 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow move with no translation and one pass', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When doing a move containing zero translations and one pass
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.empty(),
                               MGPOptional.empty(),
                               MGPOptional.of(new MoveCoordToCoord(new Coord(3, 0), new Coord(2, 0)))).get();

        // Then it should succeed
        const expectedState: DiaballikState = new DiaballikState([
            [O, O, Ȯ, O, O, O, O],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, Ẋ, X, X, X],
        ], 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow move with two translations and no pass', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When doing a move containing two translations and no pass
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.of(new MoveCoordToCoord(new Coord(1, 0), new Coord(1, 1))),
                               MGPOptional.of(new MoveCoordToCoord(new Coord(0, 0), new Coord(0, 1))),
                               MGPOptional.empty()).get();

        // Then it should succeed
        const expectedState: DiaballikState = new DiaballikState([
            [_, _, O, Ȯ, O, O, O],
            [O, O, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, Ẋ, X, X, X],
        ], 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    });
    it('should allow move with one translation and no pass', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When doing a move containing one translation and no pass
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.of(new MoveCoordToCoord(new Coord(1, 0), new Coord(1, 1))),
                               MGPOptional.empty(),
                               MGPOptional.empty()).get();

        // Then it should succeed
        const expectedState: DiaballikState = new DiaballikState([
            [O, _, O, Ȯ, O, O, O],
            [_, O, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, Ẋ, X, X, X],
        ], 1);
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState);
    })
    it('should forbid moving with the ball', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When trying to move with the ball
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.of(new MoveCoordToCoord(new Coord(3, 0), new Coord(3, 1))),
                               MGPOptional.empty(),
                               MGPOptional.empty()).get();

        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, DiaballikFailure.CANNOT_MOVE_WITH_BALL());
    });
    it('should forbid moving from an empty space', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When trying to move from an empty space
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.of(new MoveCoordToCoord(new Coord(3, 3), new Coord(3, 4))),
                               MGPOptional.empty(),
                               MGPOptional.empty()).get();

        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    });
    it('should forbid moving opponent pieces', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When trying to move a piece of the opponent
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.of(new MoveCoordToCoord(new Coord(0, 6), new Coord(0, 5))),
                               MGPOptional.empty(),
                               MGPOptional.empty()).get();

        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    });
    it('should forbid moving to an occupied space', () => {
        // Given a state
        const state: DiaballikState = DiaballikState.getInitialState();

        // When trying to move to an occupied space
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.of(new MoveCoordToCoord(new Coord(1, 0), new Coord(2, 0))),
                               MGPOptional.empty(),
                               MGPOptional.empty()).get();

        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
    });
    it('should forbid making a pass on an obstructed path', () => {
        // Given a state where a pass may be obstructed
        const state: DiaballikState = new DiaballikState([
            [O, O, O, Ȯ, _, O, O],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, Ẋ, _, X, X],
        ], 0);

        // When trying to pass on an obstructed path
        const pass: MoveCoordToCoord = new MoveCoordToCoord(new Coord(3, 0), new Coord(3, 4))
        const move: DiaballikMove =
            DiaballikMove.from(MGPOptional.empty(),
                               MGPOptional.empty(),
                               MGPOptional.of(pass)).get();

        // Then it should fail
        RulesUtils.expectMoveFailure(rules, state, move, DiaballikFailure.PASS_PATH_OBSTRUCTED());
    });
    it('should adhere to anti-game rule', () => {
        // Given a state where a player has 3 pieces against a blocked line from its opponent
        const state: DiaballikState = new DiaballikState([
            [_, _, O, Ȯ, O, O, O],
            [_, O, _, X, _, _, _],
            [O, X, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, Ẋ, _, _, _],
        ], 0);
        const node: DiaballikNode = new DiaballikNode(state);
        // When checking for victory
        // Then it should detect a victory for the blocked player
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, []);
    });
    it('should detect victory (Player.ZERO)', () => {
        // Given a state where player zero has pushed their ball to the end
        const state: DiaballikState = new DiaballikState([
            [O, O, O, _, _, O, O],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, Ẋ, Ȯ, X, X],
        ], 0);
        const node: DiaballikNode = new DiaballikNode(state);
        // When checking for victory
        // Then it should detect the victory
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, []);
    });
    it('should detect victory (Player.ONE)', () => {
        // Given a state where player one has pushed their ball to the end
        const state: DiaballikState = new DiaballikState([
            [O, O, O, Ẋ, _, O, O],
            [_, _, _, _, _, _, _],
            [_, _, _, X, _, _, _],
            [_, _, _, _, Ȯ, _, _],
            [_, _, _, O, _, _, _],
            [_, _, _, _, _, _, _],
            [X, X, X, _, _, X, X],
        ], 0);
        const node: DiaballikNode = new DiaballikNode(state);
        // When checking for victory
        // Then it should detect the victory
        RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, []);
    });
});
