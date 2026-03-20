/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';

import { MinimalUser } from '../../../domain/MinimalUser';
import { UserMocks } from '../../../domain/UserMocks.spec';
import { AwaleComponent } from '../../../games/mancala/awale/awale.component';
import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';

import { OnlineGameWrapperComponent } from './online-game-wrapper.component';
import { prepareStartedGameFor } from './online-game-wrapper.helpers.component.spec';

describe('OnlineGameWrapperComponent of Reversable Game:', () => {

    let testUtils: ComponentTestUtils<AwaleComponent, MinimalUser>;

    it('should have a rotation not applied for player zero', fakeAsync(async() => {
        // Given a game started for opponent (Player.ZERO)
        testUtils = (await prepareStartedGameFor<AwaleComponent>(UserMocks.CREATOR_AUTH_USER, 'Awale')).testUtils;

        // When displaying the component
        tick(2);
        testUtils.detectChanges();

        // Then the svg component should have no rotation
        const wrapper: OnlineGameWrapperComponent = testUtils.getWrapper() as OnlineGameWrapperComponent;
        expect(wrapper.gameComponent.rotation).toBe('rotate(0)');
        tick(wrapper.configRoom.moveDuration * 1000);
    }));

    it('should have a rotation applied for player one', fakeAsync(async() => {
        // Given a game started for opponent (Player.ONE)
        testUtils = (await prepareStartedGameFor<AwaleComponent>(UserMocks.OPPONENT_AUTH_USER, 'Awale')).testUtils;

        // When displaying the component
        tick(2);
        testUtils.detectChanges();

        // Then the svg component should have a rotation of 180°
        const wrapper: OnlineGameWrapperComponent = testUtils.getWrapper() as OnlineGameWrapperComponent;
        expect(wrapper.gameComponent.rotation).toBe('rotate(180)');
        tick(wrapper.configRoom.moveDuration * 1000);
    }));
});
