/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LodestoneComponent } from '../lodestone.component';
import { LodestoneFailure } from '../LodestoneFailure';
import { LodestoneMove } from '../LodestoneMove';
import { LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestonePiecePlayer } from '../LodestonePiece';
import { LodestoneLodestones, LodestonePressurePlate, LodestonePressurePlates, LodestoneState } from '../LodestoneState';

fdescribe('LodestoneComponent', () => {
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

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<LodestoneComponent>('Lodestone');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    it('should allow placing a lodestone by selecting it and then clicking on an empty square', fakeAsync(async() => {
        // Given the initial state
        // When clicking on a lodestone and then on an empty square
        await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
        // Then the move should succeed (in case this is a move without capture)
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false);
        await testUtils.expectMoveSuccess('#square_0_0', move);
    }));
    it('should allow placing a lodestone by clicking on an empty square and then selecting a lodestone', fakeAsync(async() => {
        // Given the initial state
        // When clicking on a on an empty square and then on a lodestone
        await testUtils.expectClickSuccess('#square_0_0');
        // Then the move should succeed (in case this is a move without capture)
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false);
        await testUtils.expectMoveSuccess('#lodestone_push_orthogonal', move);
    }));
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
        await testUtils.expectClickFailure('#pressurePlate_top', LodestoneFailure.NO_CAPTURES_TO_PLACE_YET());
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
        testUtils.expectElementToHaveClass('#lodestone_push_orthogonal > .outside', 'selected');
    }));
    it('should deselect lodestone and square after move has been made', fakeAsync(async() => {
        // Given a state
        await testUtils.expectClickSuccess('#square_0_0');
        // When performing a move
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false);
        await testUtils.expectMoveSuccess('#lodestone_push_orthogonal', move);
        // Then the selected lodestone and square should not be 'selected', and moved square should be 'moved'
        testUtils.expectElementNotToHaveClass('#lodestone_push_orthogonal > .outside', 'selected');
        testUtils.expectElementNotToExist('#selection_0_0');
    }));
    it('should highlight moved square', fakeAsync(async() => {
        // Given a state
        await testUtils.expectClickSuccess('#square_0_0');
        // When performing a move
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false);
        await testUtils.expectMoveSuccess('#lodestone_push_orthogonal', move);
        // Then the square part of the move should be shown as 'moved'

        testUtils.expectElementToHaveClass('#square_0_0', 'moved');
        testUtils.expectElementToHaveClass('#square_5_0', 'moved');
        testUtils.expectElementToHaveClass('#square_6_0', 'moved');
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
    it('should put captures on the selected pressure plate and highlight it as moved', fakeAsync(async() => {
        // Given an intermediary state where a lodestone has been placed, resulting in 2 captures
        await testUtils.expectClickSuccess('#square_3_3');
        await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
        // When the the player clicks on the plates where the captures will go
        await testUtils.expectClickSuccess('#pressurePlate_top');
        testUtils.expectElementToExist('#platePiece_top_0');
        // Then the move should be performed, and the captures should be shown
        const move: LodestoneMove = new LodestoneMove(new Coord(3, 3), 'push', false, { top: 2, bottom: 0, left: 0, right: 0 });
        await testUtils.expectMoveSuccess('#pressurePlate_top', move);
        testUtils.expectElementToExist('#platePiece_top_1');
        testUtils.expectElementToHaveClass('#plateSquare_top_0', 'moved');
        testUtils.expectElementToHaveClass('#plateSquare_top_1', 'moved');
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
        const lodestones: LodestoneLodestones = [
            MGPOptional.empty(),
            MGPOptional.empty(),
        ];
        const pressurePlates: LodestonePressurePlates = {
            ...allPressurePlates,
            top: LodestonePressurePlate.EMPTY_5.addCaptured(Player.ONE, 4),
        };
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);
        testUtils.setupState(state);
        // When filling the pressure plate
        await testUtils.expectClickSuccess('#square_0_0');
        await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
        // Then removed squares should not be shown, and the new pressure plate should be shown
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false, { top: 4, bottom: 0, left: 0, right: 0 });
        await testUtils.expectMoveSuccess('#pressurePlate_top', move);
        testUtils.expectElementNotToExist('#square_0_0');
        testUtils.expectElementToExist('#plateSquare_top_0');
        testUtils.expectElementToExist('#plateSquare_top_1');
        testUtils.expectElementToExist('#plateSquare_top_2');
        testUtils.expectElementNotToExist('#plateSquare_top_3');
    }));
    it('should crumble a pressure plate when full (second time)', fakeAsync(async() => {
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
        const lodestones: LodestoneLodestones = [
            MGPOptional.empty(),
            MGPOptional.empty(),
        ];
        const pressurePlates: LodestonePressurePlates = {
            ...allPressurePlates,
            top: LodestonePressurePlate.EMPTY_3.addCaptured(Player.ONE, 2),
        };
        const state: LodestoneState = new LodestoneState(board, 0, lodestones, pressurePlates);
        testUtils.setupState(state);
        // When filling the pressure plate
        await testUtils.expectClickSuccess('#square_0_0');
        await testUtils.expectClickSuccess('#lodestone_push_orthogonal');
        // Then removed squares should not be shown, and this pressure plate should not be shown anymore
        const move: LodestoneMove = new LodestoneMove(new Coord(0, 0), 'push', false, { top: 4, bottom: 0, left: 0, right: 0 });
        await testUtils.expectMoveSuccess('#pressurePlate_top', move);
        testUtils.expectElementNotToExist('#square_0_1');
        testUtils.expectElementNotToExist('#pressurePlate_top');
    }));
    it('should crumble a pressure plate also in the middle of placing capture', fakeAsync(async() => {
    }));
    it('should reallow selecting any lodestone face if a lodestone is not on the board', fakeAsync(async() => {
    }));
});
