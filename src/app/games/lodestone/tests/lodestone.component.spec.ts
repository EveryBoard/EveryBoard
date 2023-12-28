/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LodestoneComponent } from '../lodestone.component';
import { LodestoneFailure } from '../LodestoneFailure';
import { LodestoneMove } from '../LodestoneMove';
import { LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestonePiecePlayer } from '../LodestonePiece';
import { PlayerMap } from 'src/app/jscaip/PlayerMap';
import { LodestonePositions, LodestonePressurePlateGroup, LodestonePressurePlates, LodestoneState } from '../LodestoneState';

describe('LodestoneComponent', () => {

    let testUtils: ComponentTestUtils<LodestoneComponent>;

    const N: LodestonePiece = LodestonePieceNone.UNREACHABLE;
    const _: LodestonePiece = LodestonePieceNone.EMPTY;
    const O: LodestonePiece = LodestonePiecePlayer.ZERO;
    const X: LodestonePiece = LodestonePiecePlayer.ONE;

    const allPressurePlates: LodestonePressurePlates = LodestoneState.INITIAL_PRESSURE_PLATES;

    const noLodestones: LodestonePositions = new MGPMap();

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<LodestoneComponent>('Lodestone');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    describe('first click', () => {

        it('should forbid placing a lodestone on an occupied square', fakeAsync(async() => {
            // Given the initial state
            // When clicking on a an occupied square
            // Then the move should fail
            await testUtils.expectClickFailure('#square_1_1', RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }));

        it('should forbid selecting a pressure plate if no capture has been made yet', fakeAsync(async() => {
            // Given the initial state
            // When clicking on a pressure plate
            // Then the move should fail
            await testUtils.expectClickFailure('#plate_top_0_0', LodestoneFailure.NO_CAPTURES_TO_PLACE_YET());
        }));

        it('should highlight the selected square', fakeAsync(async() => {
            // Given the initial state
            // When clicking on a square
            await testUtils.expectClickSuccess('#square_0_0');
            // Then it should be selected
            testUtils.expectElementToExist('#selection_0_0');
        }));

        it('should highlight the selected lodestone', fakeAsync(async() => {
            // Given the initial state
            // When clicking of a lodestone
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            // Then it should be selected
            testUtils.expectElementToHaveClass('#lodestone_push_orthogonal_PLAYER_ZERO > g > .lodestone_main_circle', 'selected-stroke');
        }));

        it('should hide last move when selecting lodestone', fakeAsync(async() => {
            // Given a board with last move including captures
            const previousBoard: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, X, _, _, _],
            ];
            const previousState: LodestoneState = new LodestoneState(previousBoard, 0, noLodestones, allPressurePlates);
            const previousMove: LodestoneMove = new LodestoneMove(new Coord(4, 4),
                                                                  'push',
                                                                  'orthogonal',
                                                                  { top: 1, bottom: 0, left: 0, right: 0 });
            const A: LodestonePiece = LodestonePieceLodestone.ZERO_PUSH_ORTHOGONAL;
            const board: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 1),
            };
            const expectedLodestones: LodestonePositions = new MGPMap([
                { key: Player.ZERO, value: new Coord(4, 4) },
            ]);
            const state: LodestoneState = new LodestoneState(board, 1, expectedLodestones, pressurePlates);
            await testUtils.setupState(state, { previousState, previousMove });
            testUtils.expectElementToHaveClass('#plateSquare_top_0_0', 'moved-fill'); // So moved are shown before first click
            testUtils.expectElementToHaveClass('#square_4_7 > .lodestone_square', 'captured-fill'); // So captures are shown before first click

            // When selecting your lodestone
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ONE');

            // Then last-turn-captured square should no longer be shown
            testUtils.expectElementNotToHaveClass('#plateSquare_top_0_0', 'moved-fill');
            // And last-turn-filled lodestone should no longer be shown
            testUtils.expectElementNotToHaveClass('#square_4_7 > .lodestone_square ', 'captured-fill');
        }));

        it('should hide last move when selecting coord', fakeAsync(async() => {
            // Given a board with last move including captures
            const previousBoard: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, X, _, _, _],
            ];
            const previousState: LodestoneState = new LodestoneState(previousBoard, 0, noLodestones, allPressurePlates);
            const previousMove: LodestoneMove = new LodestoneMove(new Coord(4, 4),
                                                                  'push',
                                                                  'orthogonal',
                                                                  { top: 1, bottom: 0, left: 0, right: 0 });
            const A: LodestonePiece = LodestonePieceLodestone.ZERO_PUSH_ORTHOGONAL;
            const board: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 1),
            };
            const expectedLodestones: LodestonePositions = new MGPMap([
                { key: Player.ZERO, value: new Coord(4, 4) },
            ]);
            const state: LodestoneState = new LodestoneState(board, 1, expectedLodestones, pressurePlates);
            await testUtils.setupState(state, { previousState, previousMove });
            testUtils.expectElementToHaveClass('#plateSquare_top_0_0', 'moved-fill'); // So moved are shown before first click
            testUtils.expectElementToHaveClass('#square_4_7 > .lodestone_square', 'captured-fill'); // So captures are shown before first click

            // When selecting your coord
            await testUtils.expectClickSuccess('#square_0_0');

            // Then last-turn-captured square should no longer be shown
            testUtils.expectElementNotToHaveClass('#plateSquare_top_0_0', 'moved-fill');
            // And last-turn-filled lodestone should no longer be shown
            testUtils.expectElementNotToHaveClass('#square_4_7 > .lodestone_square ', 'captured-fill');
        }));

    });

    describe('second click', () => {

        it('should allow placing a lodestone by selecting it and then clicking on an empty square', fakeAsync(async() => {
            // Given the initial state
            // When clicking on a lodestone and then on an empty square
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            // Then the move should succeed (in case this is a move without capture)
            const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'orthogonal');
            await testUtils.expectMoveSuccess('#square_0_0', move);
        }));

        it('should allow placing a lodestone by clicking on an empty square and then selecting a lodestone', fakeAsync(async() => {
            // Given the initial state
            // When clicking on a on an empty square and then on a lodestone
            await testUtils.expectClickSuccess('#square_0_0');
            // Then the move should succeed (in case this is a move without capture)
            const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'pull', 'diagonal');
            await testUtils.expectMoveSuccess('#lodestone_pull_diagonal_PLAYER_ZERO', move);
        }));

        it('should deselect lodestone and square after move has been made', fakeAsync(async() => {
            // Given a state
            await testUtils.expectClickSuccess('#square_0_0');

            // When performing a move
            const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'orthogonal');
            await testUtils.expectMoveSuccess('#lodestone_push_orthogonal_PLAYER_ZERO', move);

            // Then the selected lodestone and square should not be 'selected'
            testUtils.expectElementNotToHaveClass('#lodestone_push_orthogonal_PLAYER_ZERO', 'selected-stroke');
            testUtils.expectElementNotToExist('#selection_0_0');
        }));

        it('should highlight moved square', fakeAsync(async() => {
            // Given a state
            await testUtils.expectClickSuccess('#square_0_0');
            // When performing a move
            const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'orthogonal');
            await testUtils.expectMoveSuccess('#lodestone_push_orthogonal_PLAYER_ZERO', move);
            // Then the square part of the move should be shown as 'moved-fill'
            testUtils.expectElementToHaveClass('#square_0_0 > rect', 'moved-fill');
            testUtils.expectElementToHaveClass('#square_5_0 > rect', 'moved-fill');
            testUtils.expectElementToHaveClass('#square_6_0 > rect', 'moved-fill');
        }));

        it('should show intermediary state before placing captures', fakeAsync(async() => {
            // Given the initial state
            // When The player places the lodestone, but the move is not finished yet
            await testUtils.expectClickSuccess('#square_3_3');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            // Then the lodestone should be shown on the board, and the moved pieces too
            testUtils.expectElementToExist('#lodestone_3_3');
            testUtils.expectElementNotToExist('#piece_3_0');
        }));

        it('should deselect square when clicking on it again', fakeAsync(async() => {
            // Given a board with a selected square
            await testUtils.expectClickSuccess('#square_0_0');

            // When clicking on it again
            await testUtils.expectClickFailure('#square_0_0');

            // Then it should no longer be selected
            testUtils.expectElementNotToExist('#selection_0_0');
        }));

        it('should deselect lodestone when clicking on it again', fakeAsync(async() => {
            // Given the initial state where a lodestone is selected
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');

            // When clicking on that lodestone again
            await testUtils.expectClickFailure('#lodestone_push_orthogonal_PLAYER_ZERO');

            // Then it should no longer be selected
            testUtils.expectElementNotToHaveClass('#lodestone_push_orthogonal_PLAYER_ZERO > g > .lodestone_main_circle', 'selected-stroke');
        }));

        it('should show last move again when deselecting lodestone', fakeAsync(async() => {
            // Given a board with last move including captures, and the lodestone selected
            const previousBoard: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, X, _, _, _],
            ];
            const previousState: LodestoneState = new LodestoneState(previousBoard, 0, noLodestones, allPressurePlates);
            const previousMove: LodestoneMove = new LodestoneMove(new Coord(4, 4),
                                                                  'push',
                                                                  'orthogonal',
                                                                  { top: 1, bottom: 0, left: 0, right: 0 });
            const A: LodestonePiece = LodestonePieceLodestone.ZERO_PUSH_ORTHOGONAL;
            const board: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 1),
            };
            const expectedLodestones: LodestonePositions = new MGPMap([
                { key: Player.ZERO, value: new Coord(4, 4) },
            ]);
            const state: LodestoneState = new LodestoneState(board, 1, expectedLodestones, pressurePlates);
            await testUtils.setupState(state, { previousState, previousMove });
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ONE');
            testUtils.expectElementNotToHaveClass('#plateSquare_top_0_0', 'moved-fill');
            testUtils.expectElementNotToHaveClass('#square_4_7 > .lodestone_square ', 'captured-fill');


            // When de-selecting your lodestone
            await testUtils.expectClickFailure('#lodestone_push_orthogonal_PLAYER_ONE');

            // Then last-turn-captured square should again be shown
            testUtils.expectElementToHaveClass('#plateSquare_top_0_0', 'moved-fill');
            // And last-turn-filled lodestone should again be shown
            testUtils.expectElementToHaveClass('#square_4_7 > .lodestone_square ', 'captured-fill');
        }));

        it('should show last move again when deselecting coord', fakeAsync(async() => {
            // Given a board with last move including captures, and the coord selected
            const previousBoard: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, X, _, _, _],
            ];
            const previousState: LodestoneState = new LodestoneState(previousBoard, 0, noLodestones, allPressurePlates);
            const previousMove: LodestoneMove = new LodestoneMove(new Coord(4, 4),
                                                                  'push',
                                                                  'orthogonal',
                                                                  { top: 1, bottom: 0, left: 0, right: 0 });
            const A: LodestonePiece = LodestonePieceLodestone.ZERO_PUSH_ORTHOGONAL;
            const board: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, A, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 1),
            };
            const expectedLodestones: LodestonePositions = new MGPMap([
                { key: Player.ZERO, value: new Coord(4, 4) },
            ]);
            const state: LodestoneState = new LodestoneState(board, 1, expectedLodestones, pressurePlates);
            await testUtils.setupState(state, { previousState, previousMove });
            await testUtils.expectClickSuccess('#square_7_7');
            testUtils.expectElementNotToHaveClass('#plateSquare_top_0_0', 'moved-fill');
            testUtils.expectElementNotToHaveClass('#square_4_7 > .lodestone_square ', 'captured-fill');

            // When de-selecting your coord
            await testUtils.expectClickFailure('#square_7_7');

            // Then last-turn-captured square should again be shown
            testUtils.expectElementToHaveClass('#plateSquare_top_0_0', 'moved-fill');
            // And last-turn-filled lodestone should again be shown
            testUtils.expectElementToHaveClass('#square_4_7 > .lodestone_square ', 'captured-fill');
        }));

    });

    describe('post move captures', () => {

        it('should put captures on the selected pressure plate and highlight it as moved', fakeAsync(async() => {
            // Given an intermediary state where a lodestone has been placed, resulting in 2 captures
            await testUtils.expectClickSuccess('#square_3_3');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            testUtils.expectElementNotToExist('#platePiece_top_0_0');

            // When the player clicks on the plates where the captures will go
            await testUtils.expectClickSuccess('#plate_top_0_0');

            // Then the move should be performed
            const move: LodestoneMove = new LodestoneMove(new Coord(3, 3),
                                                          'push',
                                                          'orthogonal',
                                                          { top: 2, bottom: 0, left: 0, right: 0 });
            await testUtils.expectMoveSuccess('#plate_top_0_1', move);

            // And the captures should be shown
            testUtils.expectElementToExist('#platePiece_top_0_0');
            testUtils.expectElementToExist('#platePiece_top_0_1');
            testUtils.expectElementToHaveClass('#plateSquare_top_0_0', 'moved-fill');
            testUtils.expectElementToHaveClass('#plateSquare_top_0_1', 'moved-fill');
        }));

        it('should remove a temporary capture from pressure plate when it is clicked again', fakeAsync(async() => {
            // Given an intermediary plate where a capture has been placed on a pressure plate
            await testUtils.expectClickSuccess('#square_3_3');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            await testUtils.expectClickSuccess('#plate_top_0_0');
            // When the player clicks on the piece that has been placed on the pressure plate
            await testUtils.expectClickSuccess('#plate_top_0_0');
            // Then it should be deselected
            testUtils.expectElementNotToExist('#platePiece_top_0_0');
        }));

        it('should crumble a pressure plate when full (first time)', fakeAsync(async() => {
            // Given a state where a pressure plate will soon crumble
            const board: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                right: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 4),
            };
            const state: LodestoneState = new LodestoneState(board, 0, noLodestones, pressurePlates);
            await testUtils.setupState(state);

            // When filling the pressure plate
            await testUtils.expectClickSuccess('#square_7_7');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            const move: LodestoneMove = new LodestoneMove(new Coord(7, 7),
                                                          'push',
                                                          'orthogonal',
                                                          { top: 0, bottom: 0, left: 0, right: 1 });
            await testUtils.expectMoveSuccess('#plate_right_0_4', move);

            // Then removed squares should be hidden
            testUtils.expectElementNotToExist('#square_7_7 > .lodestone_square');
            // And their polygon should show them as crumbled
            // Captured for the piece, moved for the lodestone
            testUtils.expectElementToHaveClass('#square_7_7 > .lodestone_crumbled_square > polygon', 'moved-fill');
            testUtils.expectElementToHaveClass('#square_7_0 > .lodestone_crumbled_square > polygon', 'captured-fill');
            // And the plate should be full
            testUtils.expectElementToExist('#platePiece_right_0_0');
            testUtils.expectElementToExist('#platePiece_right_0_1');
            testUtils.expectElementToExist('#platePiece_right_0_2');
            testUtils.expectElementToExist('#platePiece_right_0_3');
            testUtils.expectElementToExist('#platePiece_right_0_4');
            // And the crumbled lodestone should be there
            testUtils.expectElementToHaveClasses('#lodestone_7_7', ['semi-transparent']);
            testUtils.expectElementToHaveClasses('#lodestone_push_orthogonal_PLAYER_ZERO_arrow_0', ['base', 'no-stroke', 'player1-fill']);
            testUtils.expectElementToHaveClasses('#lodestone_push_orthogonal_PLAYER_ZERO_arrow_1', ['base', 'no-stroke', 'player1-fill']);
            testUtils.expectElementToHaveClasses('#lodestone_push_orthogonal_PLAYER_ZERO_arrow_2', ['base', 'no-stroke', 'player1-fill']);
            testUtils.expectElementToHaveClasses('#lodestone_push_orthogonal_PLAYER_ZERO_arrow_3', ['base', 'no-stroke', 'player1-fill']);
        }));

        it('should display crumbled lodestone and pieces in the middle of placing capture', fakeAsync(async() => {
            // Given a state where a pressure plate will soon crumble
            const board: Table<LodestonePiece> = [
                [X, X, _, _, X, _, X, X],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 4),
            };
            const state: LodestoneState = new LodestoneState(board, 0, noLodestones, pressurePlates);
            await testUtils.setupState(state);

            // When filling the pressure plate in the middle of a move
            await testUtils.expectClickSuccess('#square_2_0');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            await testUtils.expectClickSuccess('#plate_top_0_4');

            // Then the lodestone should be displayed semi-transparent as crumbled
            testUtils.expectElementToHaveClasses('#lodestone_2_0', ['semi-transparent']);
            testUtils.expectElementToHaveClasses('#piece_0_0', ['base', 'player1-fill', 'semi-transparent']);
            testUtils.expectElementNotToExist('#piece_4_0');
            testUtils.expectElementToHaveClasses('#piece_5_0', ['base', 'player1-fill', 'semi-transparent']);
            testUtils.expectElementToHaveClasses('#piece_7_0', ['base', 'player1-fill', 'semi-transparent']);
        }));

        it('should crumble a pressure plate when full (second time)', fakeAsync(async() => {
            // Given a state where a pressure plate will soon crumble
            const board: Table<LodestonePiece> = [
                [N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 7),
            };
            const state: LodestoneState = new LodestoneState(board, 0, noLodestones, pressurePlates);
            await testUtils.setupState(state);
            // When filling the pressure plate
            await testUtils.expectClickSuccess('#square_0_1');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            // Then removed squares should not be shown, and this pressure plate should not be shown anymore
            const move: LodestoneMove = new LodestoneMove(new Coord(0, 1),
                                                          'push',
                                                          'orthogonal',
                                                          { top: 1, bottom: 0, left: 0, right: 0 });
            await testUtils.expectMoveSuccess('#plate_top_0_2', move);
            testUtils.expectElementNotToExist('#square_0_1 > rect');
        }));

        it('should crumble a pressure plate also in the middle of placing capture', fakeAsync(async() => {
            // Given a state where a pressure plate will soon crumble
            const board: Table<LodestonePiece> = [
                [X, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 4),
            };
            const state: LodestoneState = new LodestoneState(board, 0, noLodestones, pressurePlates);
            await testUtils.setupState(state);

            // When filling the pressure plate in the middle of a move
            await testUtils.expectClickSuccess('#square_1_0');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            await testUtils.expectClickSuccess('#plate_top_0_4');

            // Then removed squares should be shown as crumbled (via the polygon)
            testUtils.expectElementToExist('#square_0_0 > .lodestone_crumbled_square');
            // And the full pressure plate should still be there
            testUtils.expectElementToExist('#plate_top_0_0');
            testUtils.expectElementToExist('#plate_top_0_1');
            testUtils.expectElementToExist('#plate_top_0_2');
            testUtils.expectElementToExist('#plate_top_0_3');
            testUtils.expectElementToExist('#plate_top_0_4');
            // And filled with pieces
            testUtils.expectElementToExist('#platePiece_top_0_0');
            testUtils.expectElementToExist('#platePiece_top_0_1');
            testUtils.expectElementToExist('#platePiece_top_0_2');
            testUtils.expectElementToExist('#platePiece_top_0_3');
            testUtils.expectElementToExist('#platePiece_top_0_4');
        }));

        it('should reallow selecting any lodestone face if a lodestone falls from the board', fakeAsync(async() => {
            // Given a state where a pressure plate will soon crumble, taking a lodestone with it
            const B: LodestonePiece = LodestonePieceLodestone.ONE_PULL_ORTHOGONAL;
            const board: Table<LodestonePiece> = [
                [B, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, O, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const lodestones: LodestonePositions = new MGPMap([
                { key: Player.ONE, value: new Coord(0, 0) },
            ]);
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlateGroup.of([5, 3]).addCaptured(Player.ONE, 4),
            };
            const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);
            await testUtils.setupState(state);

            // When performing a move that crumbles the pressure plate, taking the lodestone with it
            await testUtils.expectClickSuccess('#square_1_0');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            const move: LodestoneMove = new LodestoneMove(new Coord(1, 0),
                                                          'push',
                                                          'orthogonal',
                                                          { top: 1, bottom: 0, left: 0, right: 0 });
            await testUtils.expectMoveSuccess('#plate_top_0_0', move);
            // Then on the next turn, the player should be able to select any lodestone position
            testUtils.expectElementToExist('#lodestone_push_orthogonal_PLAYER_ONE');
            testUtils.expectElementToExist('#lodestone_push_diagonal_PLAYER_ONE');
            testUtils.expectElementToExist('#lodestone_pull_orthogonal_PLAYER_ONE');
            testUtils.expectElementToExist('#lodestone_pull_diagonal_PLAYER_ONE');
        }));

        it('should cancel move if clicking on board when placing captures', fakeAsync(async() => {
            // Given an intermediary state where a lodestone has been placed, resulting in 2 captures
            await testUtils.expectClickSuccess('#square_3_3');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal_PLAYER_ZERO');
            // When clicking on the board
            // Then the move should be canceled
            await testUtils.expectClickFailure('#square_0_0', LodestoneFailure.MUST_PLACE_CAPTURES());
        }));

    });

    describe('visuals', () => {

        it('should display only the available lodestones when a lodestone is already on the board', fakeAsync(async() => {
            // Given a state with the player lodestone on the board
            const O: LodestonePiece = LodestonePieceLodestone.ZERO_PULL_ORTHOGONAL;
            const board: Table<LodestonePiece> = [
                [O, _, _, _, _, _, _, X],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const lodestones: LodestonePositions = new MGPMap([
                { key: Player.ZERO, value: new Coord(0, 0) },
            ]);
            const state: LodestoneState = new LodestoneState(board, 0, lodestones, allPressurePlates);
            // When displaying the state
            await testUtils.setupState(state);
            // Then it should only show the available lodestones
            testUtils.expectElementToExist('#lodestone_push_orthogonal_PLAYER_ZERO');
            testUtils.expectElementToExist('#lodestone_push_diagonal_PLAYER_ZERO');
        }));

        it('should display score as number of captured pieces', fakeAsync(async() => {
            // Given a state
            const board: Table<LodestonePiece> = [
                [O, O, O, O, _, _, _, _],
                [X, X, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const state: LodestoneState = new LodestoneState(board, 0, noLodestones, allPressurePlates);
            // When displaying the state
            await testUtils.setupState(state);
            // Then the score should be the number of pieces captured
            expect(testUtils.getGameComponent().scores).toEqual(MGPOptional.of(PlayerMap.of(22, 20)));
        }));

    });

});
