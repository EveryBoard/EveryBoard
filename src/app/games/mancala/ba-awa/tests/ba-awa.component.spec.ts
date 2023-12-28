/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';

import { BaAwaComponent } from '../ba-awa.component';
import { BaAwaRules } from '../BaAwaRules';
import { MancalaState } from 'src/app/games/mancala/common/MancalaState';
import { MancalaComponentTestUtils, doMancalaComponentTests as doMancalaComponentTests } from '../../common/tests/GenericMancalaComponentTest.spec';
import { BaAwaMoveGenerator } from '../BaAwaMoveGenerator';
import { MancalaConfig } from '../../common/MancalaConfig';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MancalaComponent } from '../../common/MancalaComponent';

describe('BaAwaComponent', () => {

    let mancalaTestUtils: MancalaComponentTestUtils<BaAwaComponent, BaAwaRules>;
    const defaultConfig: MGPOptional<MancalaConfig> = BaAwaRules.get().getDefaultRulesConfig();

    doMancalaComponentTests({
        component: BaAwaComponent,
        gameName: 'BaAwa',
        moveGenerator: new BaAwaMoveGenerator(),
        distribution: {
            state: BaAwaRules.get().getInitialState(defaultConfig),
            move: MancalaMove.of(MancalaDistribution.of(0)),
            result: [
                { x: 0, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 1, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 2, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 3, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
            ],
        },
        secondDistribution: {
            state: new MancalaState([
                [5, 5, 5, 5, 4, 4],
                [0, 4, 4, 4, 4, 4],
            ], 1, [0, 0]),
            move: MancalaMove.of(MancalaDistribution.of(1)),
            result: [
                { x: 2, y: 0, content: { mainContent: ' 6 ', secondaryContent: ' +1 ' } },
                { x: 3, y: 0, content: { mainContent: ' 6 ', secondaryContent: ' +1 ' } },
                { x: 4, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 5, y: 0, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
                { x: 5, y: 1, content: { mainContent: ' 5 ', secondaryContent: ' +1 ' } },
            ],
        },
        monsoon: {
            state: new MancalaState([
                [0, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 4],
            ], 121, [0, 0]),
            move: MancalaMove.of(MancalaDistribution.of(5)),
            result: [{ x: 5, y: 1, content: { mainContent: ' 0 ', secondaryContent: ' -5 ' } }],
        },
        capture: {
            state: new MancalaState([
                [4, 1, 4, 4, 4, 4],
                [2, 4, 4, 4, 4, 4],
            ], 0, [0, 0]),
            move: MancalaMove.of(MancalaDistribution.of(0)),
            result: [{ x: 1, y: 0, content: { mainContent: ' 0 ', secondaryContent: ' -2 ' } }],
        },
        fillThenCapture: {
            state: new MancalaState([
                [11, 4, 4, 4, 4, 0],
                [17, 4, 4, 4, 4, 4],
            ], 0, [0, 0]),
            move: MancalaMove.of(MancalaDistribution.of(0)),
            result: [{ x: 5, y: 0, content: { mainContent: ' 0 ', secondaryContent: ' -2 ' } }],
        },
    });

    describe('Ba-awa Specific Tests', () => {

        beforeEach(fakeAsync(async() => {
            const testUtils: ComponentTestUtils<BaAwaComponent> = await ComponentTestUtils.forGame<BaAwaComponent>('BaAwa');
            mancalaTestUtils = new MancalaComponentTestUtils(testUtils, new BaAwaMoveGenerator());
        }));

        describe('Animations', () => {

            it('Should capture-on-the-go immediately', fakeAsync(async() => {
                // Given a board where a distribution pass by a capturable house
                const state: MancalaState = new MancalaState([
                    [0, 0, 0, 8, 0, 0],
                    [3, 2, 1, 0, 0, 0],
                ], 0, [0, 0]);
                await mancalaTestUtils.testUtils.setupState(state);
                const element: DebugElement = mancalaTestUtils.testUtils.findElement('#click_1_1');
                expect(element).withContext('Element "#click_1_1" should exist').toBeTruthy();
                element.triggerEventHandler('click', null);
                tick(MancalaComponent.TIMEOUT_BETWEEN_LAPS); // House emptied, waiting for lap to start

                // When feeding the capturable house
                tick(MancalaComponent.TIMEOUT_BETWEEN_SEED);

                // Then it should be captured
                mancalaTestUtils.expectToBeCaptured([{ x: 0, y: 1, content: { mainContent: ' 0 ', secondaryContent: ' -4 ' } }]);
                tick(MancalaComponent.TIMEOUT_BETWEEN_SEED); // Dropping last stone
            }));
        });
    });

    describe('Custom Config', () => {

        let testUtils: ComponentTestUtils<BaAwaComponent>;

        beforeEach(fakeAsync(async() => {
            testUtils = await ComponentTestUtils.forGame<BaAwaComponent>('BaAwa');
        }));

        it('should not require additionnal click when ending distribution in store', fakeAsync(async() => {
            // Given a Ba-awa state with a config with passByPlayerStore set to true
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
            });
            const state: MancalaState = BaAwaRules.get().getInitialState(customConfig);
            await testUtils.setupState(state, { config: customConfig });

            // When doing simple distribution ending in store
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(3));

            // Then this should trigger a single distribution move
            await testUtils.expectMoveSuccess('#click_3_1', move, 1400);
        }));

        it('should allow redistribution if allowed by config', fakeAsync(async() => {
            // Given a Ba-awa state with where multiple so would be possible, and the first sowing is done
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
                mustContinueDistributionAfterStore: true,
            });
            const state: MancalaState = BaAwaRules.get().getInitialState(customConfig);
            await testUtils.setupState(state, { config: customConfig });
            await testUtils.expectClickSuccess('#click_3_1');
            tick(1400);

            // When doing the second distribution
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(3), [MancalaDistribution.of(0)]);

            // Then this should trigger a single distribution move
            await testUtils.expectMoveSuccess('#click_0_1', move, 1500);
            const expectedState: MancalaState = new MancalaState([
                [5, 5, 5, 5, 4, 4],
                [0, 5, 5, 0, 4, 4],
            ], 1, [2, 0]);
            const actualState: MancalaState = testUtils.getGameComponent().getState();
            expect(actualState).toEqual(expectedState);
        }));

    });

});
