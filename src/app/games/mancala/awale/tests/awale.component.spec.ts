/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';

import { AwaleComponent } from '../awale.component';
import { AwaleRules } from '../AwaleRules';
import { MancalaState } from 'src/app/games/mancala/common/MancalaState';
import { doMancalaComponentTests as doMancalaComponentTests } from '../../common/tests/GenericMancalaComponentTest.spec';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { MancalaConfig } from '../../common/MancalaConfig';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';

const config: MancalaConfig = AwaleRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config;

describe('AwaleComponent', () => {

    doMancalaComponentTests({
        component: AwaleComponent,
        gameName: 'Awale',
        moveGenerator: new AwaleMoveGenerator(),
        distribution: {
            state: MancalaState.getInitialState(config),
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
            ], 1, [0, 0], config),
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
            ], 121, [0, 0], config),
            move: MancalaMove.of(MancalaDistribution.of(5)),
            result: [{ x: 5, y: 1, content: { mainContent: ' -5 ' } }],
        },
        capture: {
            state: new MancalaState([
                [4, 1, 4, 4, 4, 4],
                [2, 4, 4, 4, 4, 4],
            ], 0, [0, 0], config),
            move: MancalaMove.of(MancalaDistribution.of(0)),
            result: [{ x: 1, y: 0, content: { mainContent: ' -2 ' } }],
        },
        fillThenCapture: {
            state: new MancalaState([
                [11, 4, 4, 4, 4, 0],
                [17, 4, 4, 4, 4, 4],
            ], 0, [0, 0], config),
            move: MancalaMove.of(MancalaDistribution.of(0)),
            result: [{ x: 5, y: 0, content: { mainContent: ' -2 ' } }],
        },
    });

    describe('Cross Config Tests', () => {

        let testUtils: ComponentTestUtils<AwaleComponent>;

        beforeEach(fakeAsync(async() => {
            testUtils = await ComponentTestUtils.forGame<AwaleComponent>('Awale');
        }));

        it('should not require additionnal click when ending distribution in store', fakeAsync(async() => {
            // Given an awale state with a config with passByPlayerStore set to true
            const customConfig: MancalaConfig = {
                ...config,
                passByPlayerStore: true,
            };
            const state: MancalaState = MancalaState.getInitialState(customConfig);
            await testUtils.setupState(state);

            // When doing simple distribution ending in store
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(3));

            // Then this should trigger a single distribution move
            await testUtils.expectMoveSuccess('#click_3_1', move, 1400);
        }));

        it('should allow redistribution if allowed by config', fakeAsync(async() => {
            // Given an awale state with where multiple so would be possible, and the first sowing is done
            const customConfig: MancalaConfig = {
                ...config,
                passByPlayerStore: true,
                mustContinueDistributionAfterStore: true,
            };
            const state: MancalaState = MancalaState.getInitialState(customConfig);
            await testUtils.setupState(state);
            await testUtils.expectClickSuccess('#click_3_1');
            tick(1400);

            // When doing the second distribution
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(3), [MancalaDistribution.of(0)]);

            // Then this should trigger a single distribution move
            await testUtils.expectMoveSuccess('#click_0_1', move, 1500);
            const expectedState: MancalaState = new MancalaState([
                [5, 5, 5, 5, 4, 4],
                [0, 5, 5, 0, 4, 4],
            ], 1, [2, 0], customConfig);
            const actualState: MancalaState = testUtils.getGameComponent().getState();
            expect(actualState).toEqual(expectedState);
        }));

    });

});
