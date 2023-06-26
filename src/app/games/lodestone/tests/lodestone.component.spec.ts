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
import { LodestonePositions, LodestonePressurePlate, LodestonePressurePlates, LodestoneState } from '../LodestoneState';

describe('LodestoneComponent', () => {
    let testUtils: ComponentTestUtils<LodestoneComponent>;

    const N: LodestonePiece = LodestonePieceNone.UNREACHABLE;
    const _: LodestonePiece = LodestonePieceNone.EMPTY;
    const A: LodestonePiece = LodestonePiecePlayer.ZERO;
    const B: LodestonePiece = LodestonePiecePlayer.ONE;

    const allPressurePlates: LodestonePressurePlates = {
        top: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
        bottom: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
        left: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
        right: MGPOptional.of(LodestonePressurePlate.EMPTY_5),
    };

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
            await testUtils.expectClickFailure('#plate_top_0', LodestoneFailure.NO_CAPTURES_TO_PLACE_YET());
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
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
            // Then it should be selected
            testUtils.expectElementToHaveClass('#lodestone_push_orthogonal > .outside', 'selected-stroke');
        }));
    });
    describe('second click', () => {
        it('should allow placing a lodestone by selecting it and then clicking on an empty square', fakeAsync(async() => {
            // Given the initial state
            // When clicking on a lodestone and then on an empty square
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
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
            await testUtils.expectMoveSuccess('#lodestone_pull_diagonal', move);
        }));
        it('should deselect lodestone and square after move has been made', fakeAsync(async() => {
            // Given a state
            await testUtils.expectClickSuccess('#square_0_0');

            // When performing a move
            const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'orthogonal');
            await testUtils.expectMoveSuccess('#lodestone_push_orthogonal', move);

            // Then the selected lodestone and square should not be 'selected'
            testUtils.expectElementNotToHaveClass('#lodestone_push_orthogonal > .outside', 'selected-stroke');
            testUtils.expectElementNotToExist('#selection_0_0');
        }));
        it('should highlight moved square', fakeAsync(async() => {
            // Given a state
            await testUtils.expectClickSuccess('#square_0_0');
            // When performing a move
            const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', 'orthogonal');
            await testUtils.expectMoveSuccess('#lodestone_push_orthogonal', move);
            // Then the square part of the move should be shown as 'moved-fill'
            testUtils.expectElementToHaveClass('#square_0_0 > rect', 'moved-fill');
            testUtils.expectElementToHaveClass('#square_5_0 > rect', 'moved-fill');
            testUtils.expectElementToHaveClass('#square_6_0 > rect', 'moved-fill');
        }));
        it('should show intermediary state before placing captures', fakeAsync(async() => {
            // Given the initial state
            // When The player places the lodestone, but the move is not finished yet
            await testUtils.expectClickSuccess('#square_3_3');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
            // Then the lodestone should be shown on the board, and the moved pieces too
            testUtils.expectElementToExist('#square_3_3 > .lodestone');
            testUtils.expectElementNotToExist('#square_3_0 > circle');
        }));
        it('should deselect square when clicking on it again', fakeAsync(async() => {
            // Given a board with a selected square
            await testUtils.expectClickSuccess('#square_0_0');

            // When clicking on it again
            await testUtils.expectClickSuccess('#square_0_0');

            // Then it should no longer be selected
            testUtils.expectElementNotToExist('#selection_0_0');
        }));
        it('should deselect lodestone when clicking on it again', fakeAsync(async() => {
            // Given the initial state where a lodestone is selected
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');

            // When clicking on that lodestone again
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');

            // Then it should no longer be selected
            testUtils.expectElementNotToHaveClass('#lodestone_push_orthogonal > .outside', 'selected-stroke');
        }));
    });
    describe('post move captures', () => {
        it('should put captures on the selected pressure plate and highlight it as moved', fakeAsync(async() => {
            // Given an intermediary state where a lodestone has been placed, resulting in 2 captures
            await testUtils.expectClickSuccess('#square_3_3');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
            testUtils.expectElementNotToExist('#platePiece_top_0');
            // When the player clicks on the plates where the captures will go
            await testUtils.expectClickSuccess('#plate_top_0');
            // Then the move should be performed, and the captures should be shown
            const move: LodestoneMove = new LodestoneMove(new Coord(3, 3),
                                                          'push',
                                                          'orthogonal',
                                                          { top: 2, bottom: 0, left: 0, right: 0 });
            await testUtils.expectMoveSuccess('#plate_top_1', move);
            testUtils.expectElementToExist('#platePiece_top_0');
            testUtils.expectElementToExist('#platePiece_top_1');
            testUtils.expectElementToHaveClass('#plateSquare_top_0', 'moved-fill');
            testUtils.expectElementToHaveClass('#plateSquare_top_1', 'moved-fill');
        }));
        it('should remove a temporary capture from pressure plate when it is clicked again', fakeAsync(async() => {
            // Given an intermediary plate where a capture has been placed on a pressure plate
            await testUtils.expectClickSuccess('#square_3_3');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
            await testUtils.expectClickSuccess('#plate_top_0');
            // When the player clicks on the piece that has been placed on the pressure plate
            await testUtils.expectClickSuccess('#plate_top_0');
            // Then it should be deselected
            testUtils.expectElementNotToExist('#platePiece_top_0');
        }));
        it('should crumble a pressure plate when full (first time)', fakeAsync(async() => {
            // Given a state where a pressure plate will soon crumble
            const board: Table<LodestonePiece> = [
                [_, _, _, _, _, _, _, B],
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
                top: LodestonePressurePlate.EMPTY_5.addCaptured(Player.ONE, 4),
            };
            const state: LodestoneState = new LodestoneState(board, 0, noLodestones, pressurePlates);
            await testUtils.setupState(state);
            // When filling the pressure plate
            await testUtils.expectClickSuccess('#square_0_0');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
            // Then removed squares should not be shown, and the new pressure plate should be shown
            const move: LodestoneMove = new LodestoneMove(new Coord(0, 0),
                                                          'push',
                                                          'orthogonal',
                                                          { top: 1, bottom: 0, left: 0, right: 0 });
            await testUtils.expectMoveSuccess('#plate_top_4', move);
            testUtils.expectElementNotToExist('#square_0_0');
            testUtils.expectElementToExist('#plate_top_0');
            testUtils.expectElementToExist('#plate_top_1');
            testUtils.expectElementToExist('#plate_top_2');
            testUtils.expectElementNotToExist('#plate_top_3');
        }));
        it('should crumble a pressure plate when full (second time)', fakeAsync(async() => {
            // Given a state where a pressure plate will soon crumble
            const board: Table<LodestonePiece> = [
                [N, N, N, N, N, N, N, N],
                [_, _, _, _, _, _, _, B],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ONE, 2),
            };
            const state: LodestoneState = new LodestoneState(board, 0, noLodestones, pressurePlates);
            await testUtils.setupState(state);
            // When filling the pressure plate
            await testUtils.expectClickSuccess('#square_0_1');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
            // Then removed squares should not be shown, and this pressure plate should not be shown anymore
            const move: LodestoneMove = new LodestoneMove(new Coord(0, 1),
                                                          'push',
                                                          'orthogonal',
                                                          { top: 1, bottom: 0, left: 0, right: 0 });
            await testUtils.expectMoveSuccess('#plate_top_2', move);
            testUtils.expectElementNotToExist('#square_0_1 > rect');
            testUtils.expectElementNotToExist('#pressurePlate_top_0');
        }));
        it('should crumble a pressure plate also in the middle of placing capture', fakeAsync(async() => {
            // Given a state where a pressure plate will soon crumble
            const board: Table<LodestonePiece> = [
                [B, _, _, _, _, _, _, B],
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
                top: LodestonePressurePlate.EMPTY_5.addCaptured(Player.ONE, 4),
            };
            const state: LodestoneState = new LodestoneState(board, 0, noLodestones, pressurePlates);
            await testUtils.setupState(state);
            // When filling the pressure plate in the middle of a move
            await testUtils.expectClickSuccess('#square_1_0');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
            await testUtils.expectClickSuccess('#plate_top_4');
            // Then removed squares should not be shown, and the new pressure plate should be shown
            testUtils.expectElementNotToExist('#square_0_0');
            testUtils.expectElementToExist('#plate_top_0');
            testUtils.expectElementToExist('#plate_top_1');
            testUtils.expectElementToExist('#plate_top_2');
            testUtils.expectElementNotToExist('#plate_top_3');
        }));
        it('should reallow selecting any lodestone face if a lodestone falls from the board', fakeAsync(async() => {
            // Given a state where a pressure plate will soon crumble, taking a lodestone with it
            const X: LodestonePiece = LodestonePieceLodestone.of(Player.ONE,
                                                                 { direction: 'pull', orientation: 'orthogonal' });
            const board: Table<LodestonePiece> = [
                [X, _, _, _, _, _, _, B],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _],
            ];
            const lodestones: LodestonePositions = new MGPMap([
                { key: Player.ONE, value: new Coord(0, 0) },
            ]);
            const pressurePlates: LodestonePressurePlates = {
                ...allPressurePlates,
                top: LodestonePressurePlate.EMPTY_5.addCaptured(Player.ONE, 4),
            };
            const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);
            await testUtils.setupState(state);
            // When performing a move that crumbles the pressure plate, taking the lodestone with it
            await testUtils.expectClickSuccess('#square_1_0');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
            const move: LodestoneMove = new LodestoneMove(new Coord(1, 0),
                                                          'push',
                                                          'orthogonal',
                                                          { top: 1, bottom: 0, left: 0, right: 0 });
            await testUtils.expectMoveSuccess('#plate_top_0', move);
            // Then on the next turn, the player should be able to select any lodestone position
            testUtils.expectElementToExist('#lodestone_push_orthogonal');
            testUtils.expectElementToExist('#lodestone_push_diagonal');
            testUtils.expectElementToExist('#lodestone_pull_orthogonal');
            testUtils.expectElementToExist('#lodestone_pull_diagonal');
        }));
        it('should cancel move if clicking on board when placing captures', fakeAsync(async() => {
            // Given an intermediary state where a lodestone has been placed, resulting in 2 captures
            await testUtils.expectClickSuccess('#square_3_3');
            await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
            // When clicking on the board
            // Then the move should be cancelled
            await testUtils.expectClickFailure('#square_0_0', LodestoneFailure.MUST_PLACE_CAPTURES());
        }));
    });
    describe('visuals', () => {
        it('should display only the available lodestones when a lodestone is already on the board', fakeAsync(async() => {
            // Given a state with the player lodestone on the board
            const O: LodestonePiece = LodestonePieceLodestone.of(Player.ZERO,
                                                                 { direction: 'pull', orientation: 'orthogonal' });
            const board: Table<LodestonePiece> = [
                [O, _, _, _, _, _, _, B],
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
            testUtils.expectElementToExist('#lodestone_push_orthogonal');
            testUtils.expectElementToExist('#lodestone_push_diagonal');
        }));
        it('should display score as number of captured pieces', async() => {
            // Given a state
            const board: Table<LodestonePiece> = [
                [A, A, A, A, _, _, _, _],
                [B, B, _, _, _, _, _, _],
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
            expect(testUtils.getComponent().scores).toEqual(MGPOptional.of([22, 20]));
        });
    });
});
