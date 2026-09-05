/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';

import { PlayerNumberMap } from '@everyboard/games';
import { Table } from '@everyboard/games';
import { MancalaDistribution, MancalaMove } from '@everyboard/games';
import { MancalaState } from '@everyboard/games';
import { AwaleRules } from '@everyboard/games';
import { MancalaConfig } from '@everyboard/games';
import { MancalaFailure } from '@everyboard/games';
import { AwaleMoveGenerator } from '@everyboard/games';

import { ComponentTestUtils } from '../../../../utils/tests/TestUtils.spec';
import { doMancalaComponentTests as doMancalaComponentTests, MancalaComponentTestUtils } from '../../common/tests/GenericMancalaComponentTest.spec';
import { AwaleComponent } from '../awale.component';

const defaultConfig: MancalaConfig = AwaleRules.get().getDefaultRulesConfig();

describe('AwaleComponent', () => {

    doMancalaComponentTests({
        component: AwaleComponent,
        gameName: 'Awale',
        moveGenerator: new AwaleMoveGenerator(),
        distribution: {
            state: AwaleRules.get().getInitialState(defaultConfig),
            move: MancalaMove.of(MancalaDistribution.of(0, 1)),
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
            ], 1, PlayerNumberMap.of(0, 0)),
            move: MancalaMove.of(MancalaDistribution.of(1, 0)),
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
            ], 121, PlayerNumberMap.of(0, 0)),
            move: MancalaMove.of(MancalaDistribution.of(5, 0)),
            result: [{ x: 5, y: 1, content: { mainContent: ' 0 ', secondaryContent: ' -5 ' } }],
        },
        capture: {
            state: new MancalaState([
                [4, 1, 4, 4, 4, 4],
                [2, 4, 4, 4, 4, 4],
            ], 0, PlayerNumberMap.of(0, 0)),
            move: MancalaMove.of(MancalaDistribution.of(0, 1)),
            result: [{ x: 1, y: 0, content: { mainContent: ' 0 ', secondaryContent: ' -2 ' } }],
        },
        fillThenCapture: {
            state: new MancalaState([
                [11, 4, 4, 4, 4, 0],
                [17, 4, 4, 4, 4, 4],
            ], 0, PlayerNumberMap.of(0, 0)),
            move: MancalaMove.of(MancalaDistribution.of(0, 1)),
            result: [{ x: 5, y: 0, content: { mainContent: ' 0 ', secondaryContent: ' -2 ' } }],
        },
    });

    describe('Custom configuration', () => {

        let testUtils: ComponentTestUtils<AwaleComponent>;
        let mancalaTestUtils: MancalaComponentTestUtils<AwaleComponent, AwaleRules>;

        beforeEach(fakeAsync(async() => {
            testUtils = await ComponentTestUtils.forGame<AwaleComponent>('Awale');
            mancalaTestUtils = new MancalaComponentTestUtils(testUtils, new AwaleMoveGenerator());
        }));

        it('should not require additional click when ending distribution in store', fakeAsync(async() => {
            // Given an awale state with a config with passByPlayerStore set to true
            const customConfig: MancalaConfig = {
                ...defaultConfig,
                passByPlayerStore: true,
            };
            const state: MancalaState = AwaleRules.get().getInitialState(customConfig);
            await testUtils.setupState(state, { config: customConfig });

            // When doing simple distribution ending in store
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(3, 1));

            // Then this should trigger a single distribution move
            await mancalaTestUtils.expectMoveSuccess('#click-3-1', move, customConfig);
        }));

        it('should allow redistribution if allowed by config', fakeAsync(async() => {
            // Given an awale state with where multiple so would be possible, and the first sowing is done
            const customConfig: MancalaConfig = {
                ...defaultConfig,
                passByPlayerStore: true,
                mustContinueDistributionAfterStore: true,
            };
            const state: MancalaState = AwaleRules.get().getInitialState(customConfig);
            await testUtils.setupState(state, { config: customConfig });
            await mancalaTestUtils.expectClickSuccess('#click-3-1');

            // When doing the second distribution
            const move: MancalaMove = MancalaMove.of(MancalaDistribution.of(3, 1), [MancalaDistribution.of(0, 1)]);

            // Then this should trigger a single distribution move
            await mancalaTestUtils.expectMoveSuccess('#click-0-1', move, customConfig);
            const expectedState: MancalaState = new MancalaState([
                [5, 5, 5, 5, 4, 4],
                [0, 5, 5, 0, 4, 4],
            ], 1, PlayerNumberMap.of(2, 0));
            const actualState: MancalaState = testUtils.getGameComponent().getState();
            expect(actualState).toEqual(expectedState);
        }));

        it('should should last move on different row', fakeAsync(async() => {
            // Given a state where there has been a point-won last turn
            // and a custom config with several row
            const customConfig: MancalaConfig = {
                ...defaultConfig,
                numberOfRows: 2,
            };
            const state: MancalaState = AwaleRules.get().getInitialState(customConfig);
            await mancalaTestUtils.testUtils.setupState(state, { config: customConfig });
            const moveZero: MancalaMove = mancalaTestUtils.testUtils.getGameComponent().generateMove(0, 2);
            await mancalaTestUtils.expectMoveSuccess('#click-0-2', moveZero, customConfig);

            // When doing second turn
            const moveOne: MancalaMove = mancalaTestUtils.testUtils.getGameComponent().generateMove(0, 1);
            await mancalaTestUtils.expectMoveSuccess('#click-0-1', moveOne, customConfig);

            // Then the capture of last turn should be hidden
            mancalaTestUtils.testUtils.expectElementToHaveClass('#circle-0-1', 'last-move-stroke');
        }));

    });

    it('should not animate illegal distribution', fakeAsync(async() => {
        // Given a state where the player could feed its opponent
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(23, 23));
        const testUtils: ComponentTestUtils<AwaleComponent> = await ComponentTestUtils.forGame<AwaleComponent>('Awale');
        await testUtils.setupState(state);

        // When performing a click that would trigger an illegal move
        // Then the move should be illegal
        await testUtils.expectClickFailure('#click-0-0', MancalaFailure.SHOULD_DISTRIBUTE());
    }));

});
