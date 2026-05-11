/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { MGPOptional } from '@everyboard/lib';

import { Coord } from '../../../../jscaip/Coord';
import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { TableUtils, Table } from '../../../../jscaip/TableUtils';
import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { GoMove } from '../../GoMove';
import { GoPhase } from '../../GoPhase';
import { GoPiece } from '../../GoPiece';
import { GoState } from '../../GoState';
import { GoConfig, GoRules } from '../GoRules';
import { GoComponent } from '../go.component';

describe('GoComponent', () => {

    let testUtils: ComponentTestUtils<GoComponent>;
    const defaultConfig: GoConfig = GoRules.get().getDefaultRulesConfig();

    const _: GoPiece = GoPiece.EMPTY;
    const O: GoPiece = GoPiece.DARK;
    const X: GoPiece = GoPiece.LIGHT;

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<GoComponent>('Go');
    }));

    it('should create', () => {
        testUtils.expectToBeCreated();
    });

    it('should allow to pass twice, then use "pass" as the method to "accept"', fakeAsync(async() => {
        await testUtils.expectPassSuccess(GoMove.PASS); // Passed
        await testUtils.expectPassSuccess(GoMove.PASS); // Counting
        await testUtils.expectPassSuccess(GoMove.ACCEPT); // Accept
        await testUtils.expectPassSuccess(GoMove.ACCEPT); // Finished
        testUtils.expectPassToBeForbidden();
    }));

    it('should show captures', fakeAsync(async() => {
        const board: Table<GoPiece> = [
            [O, X, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: GoState = new GoState(board, PlayerNumberMap.of(0, 0), 1, MGPOptional.empty(), GoPhase.PLAYING);
        await testUtils.setupState(state);

        const move: GoMove = new GoMove(0, 1);
        await testUtils.expectMoveSuccess('.data-click-0-1', move);
        const goComponent: GoComponent = testUtils.getGameComponent();
        expect(goComponent.captures).toEqual([new Coord(0, 0)]);
    }));

    it('should allow simple clicks', fakeAsync(async() => {
        const move: GoMove = new GoMove(1, 1);
        await testUtils.expectMoveSuccess('.data-click-1-1', move);
        const secondMove: GoMove = new GoMove(2, 2);
        await testUtils.expectMoveSuccess('.data-click-2-2', secondMove);
    }));

    it('should show ko coord', fakeAsync(async() => {
        // Given a board in counting phase with dead and territory
        const board: Table<GoPiece> = [
            [_, X, O, _, _],
            [X, O, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: GoState =
            new GoState(board, PlayerNumberMap.of(2, 1), 3, MGPOptional.of(new Coord(0, 0)), GoPhase.COUNTING);
        const config: GoConfig = {
            ...defaultConfig,
            width: 5,
            height: 5,
        };

        // When rendering it
        await testUtils.setupState(state, { config });

        // Then it should render the dead
        testUtils.expectElementToExist('#zoom-0-zx-0-zy-0 > .data-ko-0-0');
    }));

    describe('hoshi', () => {

        it('should be in (3, 3) and other centraly symmetrical coords for 19x19 board', fakeAsync(async() => {
            // Given a 19x19 board
            const board: Table<GoPiece> = TableUtils.create(19, 19, GoPiece.EMPTY);
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING);

            // When displaying it
            await testUtils.setupState(state);

            // Then it should have hoshi in (3, 3) and (cx, 3) and the 4 central symmetric ones
            testUtils.expectElementToExist('.data-hoshi-3-3'); // Left Up
            testUtils.expectElementToExist('.data-hoshi-9-3'); // Middle Up
            testUtils.expectElementToExist('.data-hoshi-15-3'); // Right Up
            testUtils.expectElementToExist('.data-hoshi-15-9'); // Right Middle
            testUtils.expectElementToExist('.data-hoshi-15-15'); // Right Down
            testUtils.expectElementToExist('.data-hoshi-9-15'); // Middle Down
            testUtils.expectElementToExist('.data-hoshi-3-15'); // Left Down
            testUtils.expectElementToExist('.data-hoshi-3-9'); // Left Middle
        }));

        it('should be in (3, 3) and other centraly symmetrical coords for 13x13 board', fakeAsync(async() => {
            // Given a 13x13 board
            const config: GoConfig = {
                ...defaultConfig,
                height: 13,
                width: 13,
            };
            const state: GoState = GoRules.get().getInitialState(config);

            // When displaying it
            await testUtils.setupState(state, { config });

            // Then it should have hoshi in (3, 3) and the 4 central symmetric ones
            testUtils.expectElementToExist('.data-hoshi-3-3'); // Left Up
            testUtils.expectElementToExist('.data-hoshi-9-3'); // Right Up
            testUtils.expectElementToExist('.data-hoshi-9-9'); // Right Down
            testUtils.expectElementToExist('.data-hoshi-3-9'); // Left Down
            // And the (cx, 3) and the 4 other one
            testUtils.expectElementToExist('.data-hoshi-6-3'); // Middle Up
            testUtils.expectElementToExist('.data-hoshi-9-6'); // Right Middle
            testUtils.expectElementToExist('.data-hoshi-6-9'); // Middle Down
            testUtils.expectElementToExist('.data-hoshi-3-6'); // Left Middle
        }));

        it('should be in (2, 2) and other centraly symmetrical coords for 9x9 board', fakeAsync(async() => {
            // Given a 9x9 board
            const config: GoConfig = {
                ...defaultConfig,
                height: 9,
                width: 9,
            };
            const state: GoState = GoRules.get().getInitialState(config);

            // When displaying it
            await testUtils.setupState(state, { config });

            // Then it should have hoshi in (2, 2) and (cx, 2) and the 4 central symmetric ones
            testUtils.expectElementToExist('.data-hoshi-2-2'); // Left Up
            testUtils.expectElementToExist('.data-hoshi-6-2'); // Right Up
            testUtils.expectElementToExist('.data-hoshi-6-6'); // Right Down
            testUtils.expectElementToExist('.data-hoshi-2-6'); // Left Down
            // And the (3, cx) one should not be there
            testUtils.expectElementNotToExist('.data-hoshi-4-2'); // Middle Up
            testUtils.expectElementNotToExist('.data-hoshi-4-6'); // Middle Down
            testUtils.expectElementNotToExist('.data-hoshi-6-4'); // Right Middle
            testUtils.expectElementNotToExist('.data-hoshi-2-4'); // Left Middle
        }));

        it('should have a tengen when board has an odd width and height', fakeAsync(async() => {
            // Given a (odd x odd) board
            const config: GoConfig = {
                ...defaultConfig,
                height: 9,
                width: 9,
            };
            const state: GoState = GoRules.get().getInitialState(config);

            // When displaying it
            await testUtils.setupState(state);

            // Then it should have a tengen in (4, 4)
            testUtils.expectElementToExist('.data-hoshi-4-4'); // middle middle
        }));

        it('should not have a tengen when board has an even width and height', fakeAsync(async() => {
            // Given a (even x even) board
            const config: GoConfig = {
                ...defaultConfig,
                height: 10,
                width: 10,
            };
            const state: GoState = GoRules.get().getInitialState(config);

            // When displaying it
            await testUtils.setupState(state, { config });

            // Then it should not have a tengen
            testUtils.expectElementNotToExist('.data-hoshi-4-4'); // upper left potential tengen
            testUtils.expectElementNotToExist('.data-hoshi-4-5'); // down left potential tengen
            testUtils.expectElementNotToExist('.data-hoshi-5-5'); // down right potential tengen
            testUtils.expectElementNotToExist('.data-hoshi-5-4'); // upper right potential tengen
        }));

        it('should be absent when board has width of height lower than 5', fakeAsync(async() => {
            // Given a (<5 x <5) board
            const config: MGPOptional<GoConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                height: 4,
                width: 4,
            });
            const state: GoState = GoRules.get().getInitialState(config);

            // When displaying it
            await testUtils.setupState(state, { config });

            // Then it should not have any hoshi
            testUtils.expectElementNotToExist('.data-hoshi');
        }));

    });

    describe('GoBoardComponent', () => { // TODO: move to GoBoard or to zoomed go

        it('should display koCoord adequately', fakeAsync(async() => {
            // Given a provided ko coord in (1, 1) in board z=0
            const board: Table<GoPiece> = [
                [_, X, O, _, _],
                [X, O, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(2, 1), 3, MGPOptional.of(new Coord(0, 0)), GoPhase.COUNTING);
            const customConfig: MGPOptional<GoConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                width: 5,
                height: 5,
                zoom: 2,
            });

            // When displaying that koCoord on board (1, 1) at z=2
            await testUtils.setupState(state, { config: customConfig });

            // Then it should be displayed at (0, 0)
            testUtils.expectElementToExist('#zoom-0-zx-0-zy-0 > .data-ko-0-0');
        }));

        it('should emit zoom adapted coord click', fakeAsync(async() => {
            // Given any board with a zoom higher to 1
            const board: Table<GoPiece> = [
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: GoState =
                new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING);
            const config: MGPOptional<GoConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                width: 5,
                height: 5,
                zoom: 2,
            });
            await testUtils.setupState(state, { config });

            // When clicking on one of the zooms (whose local coord is != to the one in zoom 0)
            const move: GoMove = GoMove.of(new Coord(1, 0));

            // Then it should still do the correct move
            await testUtils.expectMoveSuccessWithAsymmetricNaming(
                '#zoom-1-zx-1-zy-0 .data-click-0-0',
                '.data-click-1-0',
                move,
            );
        }));

    });

    describe('Zoomed Go', () => {

        it('should display capture correctly', fakeAsync(async() => {
            // Given a zoomed go with a board about to have a capture
            const board: Table<GoPiece> = [
                [X, O, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: GoState = new GoState(
                board,
                PlayerNumberMap.of(0, 0),
                2,
                MGPOptional.empty(),
                GoPhase.PLAYING,
            );
            const customConfig: MGPOptional<GoConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                width: 5,
                height: 5,
                zoom: 3,
            });
            await testUtils.setupState(state, { config: customConfig });

            // When doing the capture
            const move: GoMove = new GoMove(0, 1);
            await testUtils.expectMoveSuccessWithAsymmetricNaming(
                '#zoom-0-zx-0-zy-0 .data-click-0-1',
                '.data-click-0-1',
                move,
            );

            // Then the zoom = 0 capture should be correct
            testUtils.expectElementToExist('#zoom-0-zx-0-zy-0 .data-capture-0-0');

            // and the zoom = 1 too
            testUtils.expectElementToExist('#zoom-1-zx-0-zy-0 .data-capture-0-0');
            testUtils.expectElementNotToExist('#zoom-1-zx-0-zy-1 .data-capture');
            testUtils.expectElementNotToExist('#zoom-1-zx-1-zy-0 .data-capture');
            testUtils.expectElementNotToExist('#zoom-1-zx-1-zy-1 .data-capture');

            // and the zoom = 2 too
            testUtils.expectElementToExist('#zoom-2-zx-0-zy-0 .data-capture-0-0');
            testUtils.expectElementNotToExist('#zoom-2-zx-0-zy-1 .data-capture');
            testUtils.expectElementNotToExist('#zoom-2-zx-0-zy-2 .data-capture');
            testUtils.expectElementNotToExist('#zoom-2-zx-1-zy-0 .data-capture');
            testUtils.expectElementNotToExist('#zoom-2-zx-1-zy-1 .data-capture');
            testUtils.expectElementNotToExist('#zoom-2-zx-1-zy-2 .data-capture');
            testUtils.expectElementNotToExist('#zoom-2-zx-2-zy-0 .data-capture');
            testUtils.expectElementNotToExist('#zoom-2-zx-2-zy-1 .data-capture');
            testUtils.expectElementNotToExist('#zoom-2-zx-2-zy-2 .data-capture');

        }));

        it('should display ko correctly', fakeAsync(async() => {
            // Given a zoomed go with a ko
            const board: Table<GoPiece> = [
                [_, _, O, _, O],
                [_, _, _, O, X],
                [_, _, _, _, _],
                [_, _, _, _, _],
                [_, _, _, _, _],
            ];
            const state: GoState = new GoState(
                board,
                PlayerNumberMap.of(1, 0),
                5,
                MGPOptional.of(new Coord(3, 0)),
                GoPhase.PLAYING,
            );
            const customConfig: MGPOptional<GoConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                width: 5,
                height: 5,
                zoom: 2,
            });

            // When rendering state
            await testUtils.setupState(state, { config: customConfig });

            // Then the zoom = 0 ko should be correct
            testUtils.expectElementToExist('#zoom-0-zx-0-zy-0 .data-ko-3-0');

            // and the zoom = 1 too
            testUtils.expectElementNotToExist('#zoom-1-zx-0-zy-0 .data-ko');
            testUtils.expectElementNotToExist('#zoom-1-zx-0-zy-1 .data-ko');
            testUtils.expectElementToExist('#zoom-1-zx-1-zy-0 .data-ko-1-0');
            testUtils.expectElementNotToExist('#zoom-1-zx-1-zy-1 .data-ko');
        }));

    });

});
