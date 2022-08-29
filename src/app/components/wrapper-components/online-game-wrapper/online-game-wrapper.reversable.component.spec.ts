/* eslint-disable max-lines-per-function */
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { serverTimestamp } from 'firebase/firestore';

import { OnlineGameWrapperComponent } from './online-game-wrapper.component';
import { JoinerDAO } from 'src/app/dao/JoinerDAO';
import { Joiner, PartStatus } from 'src/app/domain/Joiner';
import { JoinerMocks } from 'src/app/domain/JoinerMocks.spec';
import { PartDAO } from 'src/app/dao/PartDAO';
import { PartMocks } from 'src/app/domain/PartMocks.spec';
import { UserDAO } from 'src/app/dao/UserDAO';
import { ChatDAO } from 'src/app/dao/ChatDAO';
import { Part } from 'src/app/domain/Part';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { User } from 'src/app/domain/User';
import { ConnectedUserServiceMock } from 'src/app/services/tests/ConnectedUserService.spec';
import { AwaleComponent } from 'src/app/games/awale/awale.component';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AuthUser } from 'src/app/services/ConnectedUserService';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { UserMocks } from 'src/app/domain/UserMocks.spec';

describe('OnlineGameWrapperComponent of Reversable Game:', () => {

    let testUtils: ComponentTestUtils<AwaleComponent>;

    let wrapper: OnlineGameWrapperComponent;

    let joinerDAO: JoinerDAO;
    let partDAO: PartDAO;
    let userDAO: UserDAO;
    let chatDAO: ChatDAO;

    const OBSERVER: User = {
        username: 'jeanJaja',
        last_changed: {
            seconds: Date.now() / 1000,
            nanoseconds: Date.now() % 1000,
        },
        state: 'online',
        verified: true,
    };
    const USER_OBSERVER: AuthUser = new AuthUser('obs3rv3eDu8012',
                                                 MGPOptional.ofNullable(OBSERVER.username),
                                                 MGPOptional.of('observer@home'),
                                                 true);
    let observerRole: PlayerOrNone;

    async function prepareMockDBContent(initialJoiner: Joiner): Promise<void> {
        partDAO = TestBed.inject(PartDAO);
        joinerDAO = TestBed.inject(JoinerDAO);
        userDAO = TestBed.inject(UserDAO);
        chatDAO = TestBed.inject(ChatDAO);
        await joinerDAO.set('joinerId', initialJoiner);
        await partDAO.set('joinerId', PartMocks.INITIAL);
        await userDAO.set(UserMocks.OPPONENT_AUTH_USER.id, UserMocks.OPPONENT);
        await userDAO.set(UserMocks.CREATOR_AUTH_USER.id, UserMocks.CREATOR);
        await userDAO.set(USER_OBSERVER.id, OBSERVER);
        await chatDAO.set('joinerId', { messages: [], status: `I don't have a clue` });
        return Promise.resolve();
    }
    async function prepareStartedGameFor(user: AuthUser, shorterGlobalChrono?: boolean): Promise<void> {
        await prepareMockDBContent(JoinerMocks.INITIAL);
        ConnectedUserServiceMock.setUser(user);
        if (user.id === UserMocks.CREATOR_AUTH_USER.id) {
            observerRole = Player.ZERO;
        } else if (user.id === UserMocks.OPPONENT_AUTH_USER.id) {
            observerRole = Player.ONE;
        } else {
            observerRole = PlayerOrNone.NONE;
        }
        testUtils.prepareFixture(OnlineGameWrapperComponent);
        wrapper = testUtils.wrapper as OnlineGameWrapperComponent;
        testUtils.detectChanges();
        tick(1);
        testUtils.bindGameComponent();

        const partCreationId: DebugElement = testUtils.findElement('#partCreation');
        let context: string = 'partCreation id should be present after ngOnInit';
        expect(partCreationId).withContext(context).toBeTruthy();
        context = 'partCreation field should also be present';
        expect(wrapper.partCreation).withContext(context).toBeTruthy();
        await joinerDAO.update('joinerId', JoinerMocks.WITH_FIRST_CANDIDATE);
        testUtils.detectChanges();
        await joinerDAO.update('joinerId', JoinerMocks.WITH_CHOSEN_OPPONENT);
        // TODO: replace by a click on the component to really simulate it "end2end"
        testUtils.detectChanges();
        if (observerRole === Player.ZERO) { // Creator
            await wrapper.partCreation.proposeConfig();
        } else {
            await joinerDAO.update('joinerId', JoinerMocks.WITH_PROPOSED_CONFIG);
        }
        testUtils.detectChanges();
        if (shorterGlobalChrono != null) {
            await joinerDAO.update('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
                totalPartDuration: 10,
            });
        } else {
            await joinerDAO.update('joinerId', {
                partStatus: PartStatus.PART_STARTED.value,
            });
        }
        const update: Partial<Part> = {
            playerOne: 'firstCandidate',
            turn: 0,
            remainingMsForZero: 1800 * 1000,
            remainingMsForOne: 1800 * 1000,
            beginning: serverTimestamp(),
        };
        const observerRoleAsPlayer: Player = observerRole === PlayerOrNone.NONE ? Player.ZERO : observerRole as Player;
        await partDAO.updateAndBumpIndex('joinerId', observerRoleAsPlayer, 0, update);
        testUtils.detectChanges();
        return Promise.resolve();
    }
    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame('Awale');
    }));
    it('Should have a rotation not applied for player one', fakeAsync(async() => {
        // Given a game started for opponent (player two)
        await prepareStartedGameFor(UserMocks.CREATOR_AUTH_USER);
        console.log('>>> prepared started game')

        // When displaying the component
        tick(1);
        console.log('>>> ticked')
        testUtils.fixture.detectChanges();
        console.log('>>> change detected')

        // Then the svg component should have no rotation
        expect(wrapper.gameComponent.rotation).toBe('rotate(0)');
        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
    it('Should have a rotation applied for player two', fakeAsync(async() => {
        // Given a game started for opponent (player two)
        await prepareStartedGameFor(UserMocks.OPPONENT_AUTH_USER);

        // When displaying the component
        tick(1);
        testUtils.fixture.detectChanges();

        // Then the svg component should have a rotation of 180°
        expect(wrapper.gameComponent.rotation).toBe('rotate(180)');
        tick(wrapper.joiner.maximalMoveDuration * 1000);
    }));
});
