import { TestBed, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

import { MGPOptional } from '@everyboard/lib';

import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AbstractGameComponent } from '../../game-components/game-component/GameComponent';
import { MinimalUser } from 'src/app/domain/MinimalUser';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { RulesConfig, RulesConfigUtils } from 'src/app/jscaip/RulesConfigUtil';
import { AuthUser } from 'src/app/services/ConnectedUserService';
import { UserMocks } from 'src/app/domain/UserMocks.spec';
import { ConfigRoomMocks } from 'src/app/domain/ConfigRoomMocks.spec';
import { AbstractConfigRoomService, ConfigRoomService } from 'src/app/services/ConfigRoomService';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { OnlineGameWrapperComponent } from './online-game-wrapper.component';
import { OGWCTimeManagerService } from './OGWCTimeManagerService';
import { ConfigRoomServiceMock } from 'src/app/services/tests/ConfigRoomServiceMock.spec';
import { ConfigRoom, Status } from 'src/app/domain/ConfigRoom';
import { AbstractGameService, GameService } from 'src/app/services/GameService';
import { GameServiceMock } from 'src/app/services/tests/GameServiceMock.spec';
import { GameMocks } from 'src/app/domain/PartMocks.spec';

export type PreparationResult<T extends AbstractGameComponent> = {
    testUtils: ComponentTestUtils<T, MinimalUser>;
    role: PlayerOrNone;
}

export type PreparationOptions = {
    shorterGlobalClock: boolean;
    waitForGameToStart: boolean;
    runClocks: boolean;
    config: MGPOptional<RulesConfig>;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace PreparationOptions {

    export const defaultOptions: PreparationOptions = {
        shorterGlobalClock: false,
        waitForGameToStart: true,
        runClocks: true,
        config: MGPOptional.empty(),
    };

    export const dontWait: PreparationOptions = {
        ...defaultOptions,
        waitForGameToStart: false,
    };

    export const shortGlobalClock: PreparationOptions = {
        ...defaultOptions,
        shorterGlobalClock: true,
    };

    export const withoutClocks: PreparationOptions = {
        ...defaultOptions,
        runClocks: false,
    };

    export const dontWaitNoClocks: PreparationOptions = {
        ...dontWait,
        runClocks: false,
    };

}

// eslint-disable-next-line max-lines-per-function
export async function prepareStartedGameFor<T extends AbstractGameComponent>(
    user: AuthUser,
    game: string,
    preparationOptions: PreparationOptions = PreparationOptions.defaultOptions)
: Promise<PreparationResult<T>>
{
    const defaultConfig: MGPOptional<RulesConfig> = RulesConfigUtils.getGameDefaultConfig(game);
    const rulesConfig: MGPOptional<RulesConfig> = preparationOptions.config.orElse(defaultConfig);
    const testUtils: ComponentTestUtils<T, MinimalUser> = await ComponentTestUtils.basic(game);
    ConnectedUserServiceMock.setUser(user);
    testUtils.prepareFixture(OnlineGameWrapperComponent);
    if (preparationOptions.runClocks === false) {
        spyOn(TestBed.inject(OGWCTimeManagerService), 'resumeClocks').and.callFake(async() => {});
    }

    const configRoomService: ConfigRoomServiceMock =
        TestBed.inject(ConfigRoomService) as AbstractConfigRoomService as ConfigRoomServiceMock;
    testUtils.detectChanges();
    tick(0);

    // We are bypassing the entire part creation, acting like the player joins an already started game
    let configRoom: ConfigRoom = ConfigRoomMocks.withAcceptedConfig(rulesConfig);
    if (preparationOptions.shorterGlobalClock) {
        configRoom = { ...configRoom, gameDuration: 10 };
    }
    configRoomService.mockConfigRoomUpdate(configRoom);

    // This is wat was done previously, we probably don't need to do this at all.
    // const gameCreationElement: DebugElement = testUtils.findElement('#gameCreation');
    // expect(gameCreationElement).withContext('game creation should be present after ngOnInit').toBeTruthy();
    // configRoomService.mockCandidateJoined(UserMocks.OPPONENT_MINIMAL_USER);
    // testUtils.detectChanges();
    // configRoomService.mockConfigRoomUpdate(ConfigRoomMocks.withChosenOpponent(rulesConfig));
    // testUtils.detectChanges();
    // let configRoom: ConfigRoom = ConfigRoomMocks.withProposedConfig(rulesConfig);
    // if (preparationOptions.shorterGlobalClock) {
    //     configRoom = { ...configRoom, gameDuration: 10 };
    // }
    // configRoomService.mockConfigRoomUpdate(configRoom);
    // testUtils.detectChanges();
    // configRoomService.mockConfigRoomUpdate({
    //     ...configRoom,
    //     status: Status.STARTED,
    // });
    // testUtils.detectChanges();

    testUtils.detectChanges();
    if (preparationOptions.waitForGameToStart) {
        tick(2);
        testUtils.detectChanges();
        testUtils.bindGameComponent();
        testUtils.prepareSpies();

        const gameService: GameServiceMock =
            TestBed.inject(GameService) as AbstractGameService as GameServiceMock;
        await gameService.mockGameUpdate(GameMocks.STARTED);
        await gameService.mockGameEvent({
            time: 0,
            user: UserMocks.CREATOR_MINIMAL_USER,
            eventType: 'Action',
            action: 'StartGame',
        }, 0);
    }

    let role: PlayerOrNone = PlayerOrNone.NONE;
    if (user.id === UserMocks.CREATOR_AUTH_USER.id) {
        role = Player.ZERO;
    } else if (user.id === UserMocks.OPPONENT_AUTH_USER.id) {
        role = Player.ONE;
    }
    return { testUtils, role };
}
