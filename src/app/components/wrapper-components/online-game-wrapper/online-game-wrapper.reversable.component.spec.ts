/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';

import { OnlineGameWrapperComponent } from './online-game-wrapper.component';
import { AwaleComponent } from 'src/app/games/mancala/awale/awale.component';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { PreparationOptions, prepareStartedGameFor } from './online-game-wrapper.quarto.component.spec';

describe('OnlineGameWrapperComponent of Reversable Game:', () => {

    let testUtils: ComponentTestUtils<AwaleComponent, MinimalUser>;

    it('should have a rotation not applied for player zero', fakeAsync(async() => {
        // Given a game started for opponent (Player.ZERO)
        testUtils = (await prepareStartedGameFor<AwaleComponent>(UserMocks.CREATOR_AUTH_USER,
                                                                 'Awale',
                                                                 PreparationOptions.dontWait)).testUtils;

        // When displaying the component
        tick(2);
        testUtils.detectChanges();

        // Then the svg component should have no rotation
        const wrapper: OnlineGameWrapperComponent = testUtils.getWrapper() as OnlineGameWrapperComponent;
        expect(wrapper.gameComponent.rotation).toBe('rotate(0)');
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
    it('should have a rotation applied for player one', fakeAsync(async() => {
        // Given a game started for opponent (Player.ONE)
        testUtils = (await prepareStartedGameFor<AwaleComponent>(UserMocks.OPPONENT_AUTH_USER,
                                                                 'Awale',
                                                                 PreparationOptions.dontWait)).testUtils;
        // When displaying the component
        tick(2);
        testUtils.detectChanges();

        // Then the svg component should have a rotation of 180°
        const wrapper: OnlineGameWrapperComponent = testUtils.getWrapper() as OnlineGameWrapperComponent;
        expect(wrapper.gameComponent.rotation).toBe('rotate(180)');
        tick(wrapper.configRoom.maximalMoveDuration * 1000);
    }));
});
