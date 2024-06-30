/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { KamisadoColor } from '../KamisadoColor';
import { KamisadoMove } from '../KamisadoMove';
import { KamisadoState } from '../KamisadoState';
import { KamisadoPiece } from '../KamisadoPiece';
import { KamisadoNode, KamisadoRules } from '../KamisadoRules';
import { MGPOptional } from '@everyboard/lib';
import { Player } from 'src/app/jscaip/Player';
import { KamisadoFailure } from '../KamisadoFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Table } from 'src/app/jscaip/TableUtils';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

describe('KamisadoRules', () => {

    let rules: KamisadoRules;
    const defaultConfig: NoConfig = KamisadoRules.get().getDefaultRulesConfig();

    const _: KamisadoPiece = KamisadoPiece.EMPTY;
    const R: KamisadoPiece = KamisadoPiece.ZERO.RED;
    const G: KamisadoPiece = KamisadoPiece.ZERO.GREEN;
    const B: KamisadoPiece = KamisadoPiece.ZERO.BLUE;
    const P: KamisadoPiece = KamisadoPiece.ZERO.PURPLE;

    const r: KamisadoPiece = KamisadoPiece.ONE.RED;
    const o: KamisadoPiece = KamisadoPiece.ONE.ORANGE;
    const b: KamisadoPiece = KamisadoPiece.ONE.BROWN;
    const p: KamisadoPiece = KamisadoPiece.ONE.PURPLE;

    beforeEach(() => {
        rules = KamisadoRules.get();
    });

    it('should be created', () => {
        expect(rules).toBeTruthy();
    });

    describe('Allowed moves', () => {

        it('should allow vertical moves without obstacles', () => {
            // Given a board
            const board: Table<KamisadoPiece> = [
                [_, o, p, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [R, B, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(0, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When moving one piece up vertically
            const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 6));

            // Then the move should succeed
            const expectedBoard: Table<KamisadoPiece> = [
                [_, o, p, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
                [_, B, _, _, _, _, _, _],
            ];
            const expectedState: KamisadoState =
                new KamisadoState(1, KamisadoColor.PURPLE, MGPOptional.of(new Coord(2, 0)), false, expectedBoard);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow diagonal moves without obstacles', () => {
            // Given any board
            const board: Table<KamisadoPiece> = [
                [_, b, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [R, B, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When moving diagonally without obstacles
            const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(1, 6));

            // Then the move should be deemed legal
            const expectedBoard: Table<KamisadoPiece> = [
                [_, b, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, R, _, _, _, _, _, _],
                [_, B, _, _, _, _, _, _],
            ];
            const expectedState: KamisadoState =
                new KamisadoState(7, KamisadoColor.BROWN, MGPOptional.of(new Coord(1, 0)), false, expectedBoard);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should allow to pass in a stuck position', () => {
            // Given a stuck board
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [b, r, _, _, _, _, _, _],
                [R, G, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When passing
            const move: KamisadoMove = KamisadoMove.PASS;

            // Then the move should succeed
            const expectedState: KamisadoState =
                new KamisadoState(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

    });

    describe('Forbidden moves', () => {

        it('should forbid moves landing on occupied space', () => {
            // Given any board
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [r, _, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When moving a piece on another one
            const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 6));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid vertical moves with an obstacle', () => {
            // Given a board
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [r, _, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When trying to move a piece over another one
            const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 5));

            // Then the move should be illegal
            const reason: string = KamisadoFailure.MOVE_BLOCKED();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid backward moves', () => {
            // Given any board
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 6)), false, board);

            // When moving backward
            const verticalBackwardMove: KamisadoMove = KamisadoMove.of(new Coord(0, 6), new Coord(0, 7));
            const diagonalyBackwardMove: KamisadoMove = KamisadoMove.of(new Coord(0, 6), new Coord(1, 7));
            const reason: string = KamisadoFailure.DIRECTION_NOT_ALLOWED();

            // Then the move should be illegal
            RulesUtils.expectMoveFailure(rules, state, verticalBackwardMove, reason, defaultConfig);
            RulesUtils.expectMoveFailure(rules, state, diagonalyBackwardMove, reason, defaultConfig);
        });

        it('should forbid horizontal moves', () => {
            // Given any board
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [r, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(7, KamisadoColor.RED, MGPOptional.of(new Coord(0, 6)), false, board);

            // When moving backward
            const move: KamisadoMove = KamisadoMove.of(new Coord(0, 6), new Coord(7, 6));

            // Then the move should be illegal
            const reason: string = KamisadoFailure.DIRECTION_NOT_ALLOWED();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid diagonal moves with obstacles', () => {
            // Given any board where passing over a piece is possible
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, r, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When landing on a piece or passing over it
            const illegalLandingMove: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(1, 6));
            const illegalJumpOverMove: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(7, 0));

            // Then the move should be illegal
            let reason: string = RulesFailure.MUST_CLICK_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, illegalLandingMove, reason, defaultConfig);
            reason = KamisadoFailure.MOVE_BLOCKED();
            RulesUtils.expectMoveFailure(rules, state, illegalJumpOverMove, reason, defaultConfig);
        });

        it('should forbid to pass if player can play', () => {
            // Given a non-stuck board
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, r, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When user pass
            const move: KamisadoMove = KamisadoMove.PASS;

            // Then the move should be illegal
            const reason: string = RulesFailure.CANNOT_PASS();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving a piece that does not have the right color', () => {
            // Given any board
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [B, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When moving the wrong piece (but still yours)
            const move: KamisadoMove = KamisadoMove.of(new Coord(0, 2), new Coord(0, 0));

            // Then the move should be illegal
            const reason: string = KamisadoFailure.NOT_RIGHT_COLOR();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving a piece in a non-linear direction', () => {
            // Given any board
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [B, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When moving a piece not linearly
            const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(3, 5));

            // Then the move should be illegal
            const reason: string = KamisadoFailure.DIRECTION_NOT_ALLOWED();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving opponent pieces', () => {
            // Given any board
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [r, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);

            // When moving opponent's piece
            const move: KamisadoMove = KamisadoMove.of(new Coord(0, 2), new Coord(0, 0));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid moving empty pieces', () => {
            // Given the initial state
            const state: KamisadoState = KamisadoRules.get().getInitialState();

            // When moving from an empty space
            const move: KamisadoMove = KamisadoMove.of(new Coord(0, 2), new Coord(0, 0));

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

    });

    describe('Endgames', () => {

        it('should detect victory for Player.ONE', () => {
            // Given a board where Player.ONE just landed on last line
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [b, _, _, _, _, _, _, _],
                [R, G, r, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(8, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
            const node: KamisadoNode = new KamisadoNode(state);

            // Then it should be a victory
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

        it('should detect victory for Player.ZERO', () => {
            // Given a board where Player.ZERO just landed on last line
            const board: Table<KamisadoPiece> = [
                [b, P, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [R, _, _, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(8, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board);
            const node: KamisadoNode = new KamisadoNode(state);

            // Then it should be a victory
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should declare blocking player as loser', () => {
            // Given a board where Player.ONE blocked everyone
            const board: Table<KamisadoPiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [b, r, _, _, _, _, _, _],
                [R, G, B, _, _, _, _, _],
            ];
            const state: KamisadoState =
                new KamisadoState(7, KamisadoColor.RED, MGPOptional.of(new Coord(1, 6)), true, board);

            // When it's Player.ONE to play after Player.ZERO had to pass
            const node: KamisadoNode = new KamisadoNode(state);

            // Then it should be victory for Player.ZERO
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

    });

    it('should not allow creating invalid color', () => {
        expect(() => KamisadoColor.of(15)).toThrowError();
        expect(KamisadoColor.of(0)).toBe(KamisadoColor.ANY);
    });

});
