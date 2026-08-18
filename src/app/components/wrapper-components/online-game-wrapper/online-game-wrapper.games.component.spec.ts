/* eslint-disable max-lines-per-function */
import { fakeAsync, tick } from '@angular/core/testing';

import { PlayerOrNone } from '@everyboard/games';
import { ComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { MGPValidation } from '@everyboard/lib';

import { MinimalUser } from '../../../domain/MinimalUser';
import { UserMocks } from '../../../domain/UserMocks.spec';
import { AbstractGameComponent } from '../../game-components/game-component/AbstractGameComponent';
import { clickableMethods } from '../../game-components/game-component/tests/clickableMethods.spec';
import { GameInfo } from '../../normal-component/pick-game/GameInfo';

import { OnlineGameWrapperComponent, OnlineGameWrapperMessages } from './online-game-wrapper.component';
import { PreparationOptions, prepareStartedGameFor } from './online-game-wrapper.helpers.component.spec';

describe('OnlineGameWrapperComponent (games)', () => {

    const refusal: MGPValidation = MGPValidation.failure(OnlineGameWrapperMessages.CANNOT_PLAY_AS_OBSERVER());
    let testUtils: ComponentTestUtils<AbstractGameComponent, MinimalUser>;

    for (const gameInfo of GameInfo.getAllGames()) {

        it(`click methods should refuse when observer clicks (${gameInfo.urlName})`, fakeAsync(async() => {
            // Given a online game
            const game: { [methodName: string]: unknown[] } | undefined = clickableMethods[gameInfo.urlName];
            if (game == null) {
                throw new Error('Please define ' + gameInfo.urlName + ' clickable methods in here to test them.');
            }
            testUtils = (await prepareStartedGameFor<AbstractGameComponent>(UserMocks.CREATOR_AUTH_USER,
                                                                            gameInfo.urlName,
                                                                            PreparationOptions.dontWait)).testUtils;
            tick(2);
            testUtils.detectChanges();

            const wrapper: OnlineGameWrapperComponent = testUtils.getWrapper() as OnlineGameWrapperComponent;
            expect(wrapper.gameComponent).toBeDefined();
            await testUtils.getWrapper().setRole(PlayerOrNone.NONE);
            for (const methodName of Object.keys(game)) {
                const context: string = `click method ${methodName} should be defined for game ${gameInfo.name}`;
                expect(wrapper.gameComponent[methodName]).withContext(context).toBeDefined();
                // When performing any kind of click possible in the component
                const clickResult: MGPValidation =
                    await testUtils.expectToDisplayGameMessage(refusal.getReason(), async() => {
                        return wrapper.gameComponent[methodName](...game[methodName]);
                    });
                // Then it should be refused, with the reason being that we are an observer
                expect(clickResult).withContext(methodName).toEqual(refusal);
            }
            tick(wrapper.configRoom.gameDuration * 1000);
        }));

    }

});
