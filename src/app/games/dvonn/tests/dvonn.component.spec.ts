/* eslint-disable max-lines-per-function */
import { DvonnComponent } from '../dvonn.component';
import { Coord } from 'src/app/jscaip/Coord';
import { DvonnMove } from 'src/app/games/dvonn/DvonnMove';
import { DvonnPieceStack } from 'src/app/games/dvonn/DvonnPieceStack';
import { DvonnState } from 'src/app/games/dvonn/DvonnState';
import { Player } from 'src/app/jscaip/Player';
import { fakeAsync } from '@angular/core/testing';
import { DvonnFailure } from 'src/app/games/dvonn/DvonnFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('DvonnComponent', () => {

    let testUtils: ComponentTestUtils<DvonnComponent>;

    const __: DvonnPieceStack = DvonnPieceStack.EMPTY;
    const D_: DvonnPieceStack = DvonnPieceStack.SOURCE;
    const W_: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
    const WW: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, false);

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<DvonnComponent>('Dvonn');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeDefined();
        expect(testUtils.getComponent()).withContext('DvonnComponent should be created').toBeDefined();
    });
    it('should not allow to pass initially', fakeAsync(async() => {
        // Given the initial state
        // Then the player cannot pass
        testUtils.expectPassToBeForbidden();
    }));
    it('should allow valid moves', fakeAsync(async() => {
        // Given that the user has selected a valid piece
        await testUtils.expectClickSuccess('#click_2_0');
        // When the user selects a valid destination
        // Then the move should be made
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(2, 1));
        await testUtils.expectMoveSuccess('#click_2_1', move);
    }));
    it('should allow to pass if stuck position', fakeAsync(async() => {
        // Given a state where the player can't make a move
        const board: Table<DvonnPieceStack> = [
            [__, __, WW, __, __, __, __, __, __, __, __],
            [__, __, D_, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        // When it is displayed
        testUtils.setupState(state);
        // Then the player can pass
        const move: DvonnMove = DvonnMove.PASS;
        await testUtils.expectPassSuccess(move);
    }));
    it('should forbid choosing an incorrect piece', fakeAsync(async() => {
        // select dark piece (but light plays first)
        await testUtils.expectClickFailure('#click_1_1', DvonnFailure.NOT_PLAYER_PIECE());
    }));
    it('should show disconnection/captures precisely', fakeAsync(async() => {
        // Given board with ready disconnection
        const board: Table<DvonnPieceStack> = [
            [__, __, WW, __, __, __, __, __, __, __, __],
            [__, __, D_, W_, W_, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ];
        testUtils.setupState(new DvonnState(board, 0, false));

        // When doing that disconnection
        await testUtils.expectClickSuccess('#click_3_1');
        const move: DvonnMove = DvonnMove.of(new Coord(3, 1), new Coord(2, 1));
        await testUtils.expectMoveSuccess('#click_2_1', move);

        const gameComponent: DvonnComponent = testUtils.getComponent();
        // expect board to show it
        expect(gameComponent.disconnecteds).toEqual([
            { coord: new Coord(4, 1), spaceContent: W_ },
        ]);
    }));
    it('should allow clicking twice on a piece to deselect it', fakeAsync(async() => {
        await testUtils.expectClickSuccess('#click_2_0');
        await testUtils.expectClickSuccess('#click_2_0');
        expect(testUtils.getComponent().chosen).toEqual(MGPOptional.empty());
    }));
});

