/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { CoerceoMove, CoerceoRegularMove, CoerceoStep, CoerceoTileExchangeMove } from '../CoerceoMove';
import { CoerceoState } from '../CoerceoState';
import { CoerceoFailure } from '../CoerceoFailure';
import { CoerceoConfig, CoerceoNode, CoerceoRules } from '../CoerceoRules';
import { RulesUtils } from 'src/app/jscaip/tests/RulesUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { MGPOptional, TestUtils } from '@everyboard/lib';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { Table } from 'src/app/jscaip/TableUtils';

describe('CoerceoRules', () => {

    let rules: CoerceoRules;
    const defaultConfig: MGPOptional<CoerceoConfig> = CoerceoRules.get().getDefaultRulesConfig();

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.UNREACHABLE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;

    function movement(coord: Coord, step: CoerceoStep): CoerceoMove {
        return CoerceoRegularMove.ofMovement(coord, step);
    }

    beforeEach(() => {
        rules = CoerceoRules.get();
    });

    describe('movement', () => {

        it('should forbid to start move from outside the board', () => {
            // Given any board
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When trying a board starting on an empty space
            const move: CoerceoMove = movement(new Coord(0, 0), CoerceoStep.RIGHT);

            // Then it should throw
            function tryAStartingCoordOutOfRange(): void {
                rules.isLegal(move, state);
            }
            TestUtils.expectToThrowAndLog(tryAStartingCoordOutOfRange, 'Cannot start with a coord outside the board (0, 0).');
        });

        it('should forbid to end move outside the board', () => {
            // Given any board
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When doing a move leaving the board
            const move: CoerceoMove = movement(new Coord(6, 6), CoerceoStep.LEFT);

            // Then it should throw
            function tryALandingingCoordOutOfRange(): void {
                rules.isLegal(move, state);
            }
            TestUtils.expectToThrowAndLog(tryALandingingCoordOutOfRange, 'Cannot end with a coord outside the board (4, 6).');
        });

        it('should forbid to move oppponent pieces', () => {
            // Given any board
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When trying to move an opponent piece
            const move: CoerceoMove = movement(new Coord(6, 6), CoerceoStep.RIGHT);

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid to move empty pieces', () => {
            // Given any board
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When attempting to move empty pieces
            const move: CoerceoMove = movement(new Coord(7, 7), CoerceoStep.UP_RIGHT);
            const reason: string = RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY();

            // Then the move should be illegal
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid to land on occupied piece', () => {
            // Given any board
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, X, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When trying to move piece on another one
            const move: CoerceoMove = movement(new Coord(6, 6), CoerceoStep.DOWN_RIGHT);

            // Then the move should be illegal
            const reason: string = RulesFailure.MUST_LAND_ON_EMPTY_SPACE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should remove pieces captured by movement', () => {
            // Given any board where a piece could be captured
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When moving and capturing
            const move: CoerceoMove = movement(new Coord(6, 6), CoerceoStep.DOWN_RIGHT);

            // Then one piece should be moved and one captured
            const expectedBoard: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            ];
            const expectedState: CoerceoState =
                new CoerceoState(expectedBoard, 2, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 1));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should remove emptied tiles', () => {
            // Given any board where one tile could be left
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When leaving the tile
            const move: CoerceoMove = movement(new Coord(7, 5), CoerceoStep.DOWN_RIGHT);

            // Then the tile should be left
            const expectedBoard: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, O, _, _, N, N, N, N, N, N],
            ];
            const expectedState: CoerceoState =
                new CoerceoState(expectedBoard, 2, PlayerNumberMap.of(0, 1), PlayerNumberMap.of(0, 0));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should capture piece killed by tiles removal', () => {
            // Given any board where an opponent tile has a last freedom in a removable tile
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, _, O, _, N, N, N],
                [N, N, N, N, N, N, X, O, X, _, _, _, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When leaving the tile
            const move: CoerceoMove = movement(new Coord(8, 6), CoerceoStep.DOWN_RIGHT);

            // Then the tile should be removed and the piece captured
            const expectedBoard: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, X, O, _, N, N, N],
                [N, N, N, N, N, N, X, _, X, _, _, _, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
            ];
            const expectedState: CoerceoState =
                new CoerceoState(expectedBoard, 2, PlayerNumberMap.of(0, 1), PlayerNumberMap.of(0, 1));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should throw when trying out of range starting coord', () => {
            // Given any board
            const state: CoerceoState = rules.getInitialState(defaultConfig);

            // When trying a move starting from out of range
            const move: CoerceoMove = CoerceoRegularMove.ofMovement(new Coord(-1, 0), CoerceoStep.LEFT);

            // Then it should throw
            const reason: string = 'Accessing coord not on board (-1, 0).';
            function tryingOutOfRangeStartingMove(): void {
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            }
            TestUtils.expectToThrowAndLog(tryingOutOfRangeStartingMove, reason);
        });

        it('should not allow starting coord unreachable', () => {
            // Given any board
            const state: CoerceoState = rules.getInitialState(defaultConfig);

            // When starting a move on an unreachable space
            const move: CoerceoMove = CoerceoRegularMove.ofMovement(new Coord(0, 0), CoerceoStep.LEFT);

            // Then it should throw
            const reason: string = 'Cannot start with a coord outside the board (0, 0).';
            function allowOutOfRangeLandingCoord(): void {
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            }
            TestUtils.expectToThrowAndLog(allowOutOfRangeLandingCoord, reason);
        });

        it('should not allow starting coord out of board', () => {
            // Given any board
            const state: CoerceoState = rules.getInitialState(defaultConfig);

            // When starting a move on an out of range coord
            const move: CoerceoMove = CoerceoRegularMove.ofMovement(new Coord(-1, -1), CoerceoStep.LEFT);

            // Then it should throw
            const reason: string = 'Accessing coord not on board (-1, -1).';
            function allowOutOfRangeLandingCoord(): void {
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            }
            TestUtils.expectToThrowAndLog(allowOutOfRangeLandingCoord, reason);
        });

        it('should not allow ending coord to be unreachable', () => {
            // Given any board
            const state: CoerceoState = rules.getInitialState(defaultConfig);

            // When ending a move on an unreachable space
            const move: CoerceoMove = CoerceoRegularMove.ofMovement(new Coord(6, 0), CoerceoStep.LEFT);

            // Then it should throw
            const reason: string = 'Cannot end with a coord outside the board (4, 0).';
            function allowOutOfRangeLandingCoord(): void {
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            }
            TestUtils.expectToThrowAndLog(allowOutOfRangeLandingCoord, reason);
        });

        it('should not allow ending coord out of board', () => {
            // Given any board
            const state: CoerceoState = rules.getInitialState(defaultConfig);

            // When starting a move on an out of range coord
            const move: CoerceoMove = CoerceoRegularMove.ofMovement(new Coord(0, 2), CoerceoStep.LEFT);

            // Then it should throw
            const reason: string = 'Accessing coord not on board (-2, 2).';
            function allowOutOfRangeLandingCoord(): void {
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            }
            TestUtils.expectToThrowAndLog(allowOutOfRangeLandingCoord, reason);
        });

    });

    describe('Tiles Exchange', () => {

        it(`should forbid exchanges when player don't have enough tiles`, () => {
            // Given any board where player has less than two tiles
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 0));

            // When trying to do a tile exchange
            const move: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(6, 6)) as CoerceoMove;

            // Then the move should be illegal
            const reason: string = CoerceoFailure.NOT_ENOUGH_TILES_TO_EXCHANGE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid capturing one own piece', () => {
            // Given any board where player has two tiles or more
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 2), PlayerNumberMap.of(0, 0));

            // When trying to exchange your tiles to capture your own pieces
            const move: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(6, 6)) as CoerceoMove;

            // Then the move should be illegal
            const reason: string = RulesFailure.CANNOT_SELF_CAPTURE();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid capturing empty space', () => {
            // Given any state where player has two tiles or more
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 2), PlayerNumberMap.of(0, 0));

            // When trying to exchange tile for empty spaces
            const move: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(7, 7)) as CoerceoMove;

            // Then the move should be illegal
            const reason: string = CoerceoFailure.CANNOT_CAPTURE_FROM_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should forbid capturing coord of removed tile', () => {
            // Given any board where player has two tiles or more
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 2), PlayerNumberMap.of(0, 0));

            // When trying to exchange tiles with unreachable coord
            const move: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(0, 0)) as CoerceoMove;

            // Then the move should be illegal
            const reason: string = CoerceoFailure.CANNOT_CAPTURE_FROM_EMPTY();
            RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
        });

        it('should remove piece captured by tiles exchange, removing tile but no one win it', () => {
            // Given a board where a tile exchange could remove a tile
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, _, O, _, N, N, N],
                [N, N, N, N, N, N, X, _, _, _, _, _, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            ];
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 2), PlayerNumberMap.of(0, 0));

            // When doing the tile exchange
            const move: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(10, 7)) as CoerceoMove;

            // Then the removed tile should not be won by anyone
            const expectedBoard: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, X, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, X, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
            ];
            const expectedState: CoerceoState =
                new CoerceoState(expectedBoard, 2, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 1));
            RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
        });

        it('should not allow out of range capture coord', () => {
            // Given any board
            const board: Table<FourStatePiece> = rules.getInitialState(defaultConfig).board;
            const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 2), PlayerNumberMap.of(0, 0));

            // When trying to create a exchange move from an out of board coord
            const move: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(-1, 16));

            const reason: string = 'Accessing coord not on board (-1, 16).';
            function allowOutOfRangeCaptureCoord(): void {
                RulesUtils.expectMoveFailure(rules, state, move, reason, defaultConfig);
            }
            TestUtils.expectToThrowAndLog(allowOutOfRangeCaptureCoord, reason);
        });

    });

    it('should not remove tiles emptied, when connected by 3 separated sides', () => {
        // Given a board where a tile is between two others tiles and could be emptied
        const board: FourStatePiece[][] = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, X, _, _],
            [N, N, N, N, N, N, N, N, N, _, O, _, O, _, _],
            [N, N, N, N, N, N, X, _, _, _, _, _, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
        ];
        const state: CoerceoState = new CoerceoState(board, 1, PlayerNumberMap.of(0, 2), PlayerNumberMap.of(0, 0));

        // When emptying that central tile
        const move: CoerceoMove = CoerceoTileExchangeMove.of(new Coord(10, 7)) as CoerceoMove;

        // Then it should not be removed
        const expectedBoard: FourStatePiece[][] = [
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            [N, N, N, N, N, N, N, N, N, N, N, N, X, _, _],
            [N, N, N, N, N, N, N, N, N, _, _, _, O, _, _],
            [N, N, N, N, N, N, X, _, _, _, _, _, N, N, N],
            [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
        ];
        const expectedState: CoerceoState =
            new CoerceoState(expectedBoard, 2, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(0, 1));
        RulesUtils.expectMoveSuccess(rules, state, move, expectedState, defaultConfig);
    });

    describe('getGameStatus', () => {

        it('should mark Player.ZERO as winner when Player.ONE is out of pieces', () => {
            // Given a board where all piece of Player.ONE are dead
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState =
                new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(18, 17));
            const node: CoerceoNode = new CoerceoNode(state);

            // When evaluating its game status
            // Then it should be a victory for Player.ZERO
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, defaultConfig);
        });

        it('should mark Player.ONE as winner when Player.ZERO is out of pieces', () => {
            // Given a board where all piece of Player.ZERO are dead
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, X, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState =
                new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(17, 18));
            const node: CoerceoNode = new CoerceoNode(state);

            // When evaluating its game status
            // Then it should be a victory for Player.ONE
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ONE, defaultConfig);
        });

    });

    describe('Small Config', () => {

        it('should mark Player.ZERO as winner when Player.ONE is out of pieces', () => {
            // Given a board where all piece of Player.ONE are dead, but on small config
            const smallConfig: MGPOptional<CoerceoConfig> = MGPOptional.of({
                smallBoard: true,
            });
            const board: FourStatePiece[][] = [
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, _, N, N, N, N, N, N],
                [N, N, N, N, N, N, _, _, O, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
                [N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
            ];
            const state: CoerceoState =
                new CoerceoState(board, 0, PlayerNumberMap.of(0, 0), PlayerNumberMap.of(6, 5));
            const node: CoerceoNode = new CoerceoNode(state);

            // When evaluating its game status
            // Then it should be a victory for Player.ZERO
            RulesUtils.expectToBeVictoryFor(rules, node, Player.ZERO, smallConfig);
        });

        it('should be a smaller board (for coverage)', () => {
            // Given the small config
            const smallConfig: MGPOptional<CoerceoConfig> = MGPOptional.of({
                smallBoard: true,
            });

            // When creating state for this config
            const state: CoerceoState = rules.getInitialState(smallConfig);

            // Then it should be 8 x 6
            expect(state.board.length).toBe(7);
            expect(state.board[0].length).toBe(9);
        });

    });

});
