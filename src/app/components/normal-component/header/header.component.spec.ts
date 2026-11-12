/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { MGPOptional, Utils } from '@everyboard/lib';

import { UserDAO } from '../../../dao/UserDAO';
import { CurrentGame } from '../../../domain/User';
import { UserMocks } from '../../../domain/UserMocks.spec';
import { CurrentGameMocks } from '../../../domain/mocks/CurrentGameMocks.spec';
import { AuthUser, ConnectedUserService } from '../../../services/ConnectedUserService';
import { CurrentGameService } from '../../../services/CurrentGameService';
import { Language, UserSettingsService } from '../../../services/UserSettingsService';
import { ConnectedUserServiceMock } from '../../../services/tests/ConnectedUserService.spec';
import { CurrentGameServiceMock } from '../../../services/tests/CurrentGameServiceMock.spec';
import { expectValidRoutingLink, prepareUnsubscribeCheck, SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';
import { AccountComponent } from '../account/account.component';
import { GameInfo } from '../pick-game/GameInfo';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {

    let testUtils: SimpleComponentTestUtils<HeaderComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(HeaderComponent);
        const userDAO: UserDAO = TestBed.inject(UserDAO);
        await userDAO.set(UserMocks.CONNECTED_AUTH_USER.id, UserMocks.CONNECTED);
    }));
    afterEach(() => {
        localStorage.removeItem('locale');
        localStorage.removeItem('pendingLocale');
    });

    it('should create', fakeAsync(() => {
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        testUtils.detectChanges();
        expect(testUtils.getComponent()).toBeTruthy();
    }));

    it('should show a spinner while the connected user is loading', () => {
        // Given a user
        // When their connection is pending
        const pendingUserSubscription: Subscription = new Subscription();
        spyOn(TestBed.inject(ConnectedUserService), 'subscribeToUser').and.returnValue(pendingUserSubscription);
        testUtils.detectChanges();

        // Then it should not display a username, login, nor register button, but the spinner instead
        testUtils.expectElementToExist('#spinner');
        testUtils.expectElementNotToExist('#connectedUserName');
        testUtils.expectElementNotToExist('#login');
        testUtils.expectElementNotToExist('#register');
    });

    it('should bring to account settings when clicking on the account button', fakeAsync(async() => {
        // Given a connected user
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);

        // When displaying the component
        testUtils.detectChanges();

        // Then the account link should point to the account component
        const button: DebugElement = testUtils.findElement('#account');
        await expectValidRoutingLink(button, '/account', AccountComponent);
    }));

    describe('settings', () => {
        it('should open and close settings without navigating', fakeAsync(async() => {
            // Given a header with closed settings
            testUtils.detectChanges();
            testUtils.expectElementNotToExist('#settings-modal');
            const router: Router = TestBed.inject(Router);
            spyOn(router, 'navigate');

            // When clicking the settings cog
            await testUtils.clickElement('#settings');

            // Then settings are displayed without navigating
            testUtils.expectElementToExist('#settings-modal');
            expect(router.navigate).not.toHaveBeenCalled();

            // When clicking the settings cog again
            await testUtils.clickElement('#settings');

            // Then settings are closed without navigating
            testUtils.expectElementNotToExist('#settings-modal');
            expect(router.navigate).not.toHaveBeenCalled();
        }));

        it('should close settings from its close button', fakeAsync(async() => {
            // Given a header with open settings
            testUtils.detectChanges();
            await testUtils.clickElement('#settings');
            testUtils.expectElementToExist('#settings-modal');

            // When clicking the close button
            await testUtils.clickElement('#close-settings');

            // Then settings are closed
            testUtils.expectElementNotToExist('#settings-modal');
        }));

        it('should close settings from its backdrop', fakeAsync(async() => {
            // Given a header with open settings
            testUtils.detectChanges();
            await testUtils.clickElement('#settings');
            testUtils.expectElementToExist('#settings-modal');

            // When clicking the backdrop
            await testUtils.clickElement('#close-settings-backdrop');

            // Then settings are closed
            testUtils.expectElementNotToExist('#settings-modal');
        }));

        it('should not persist a candidate language when settings are closed', fakeAsync(async() => {
            // Given settings are open with a candidate language awaiting confirmation
            const userSettingsService: UserSettingsService = TestBed.inject(UserSettingsService);
            spyOn(userSettingsService, 'activateLanguage').and.callThrough();
            spyOn(userSettingsService, 'scheduleLanguageChange').and.callThrough();
            testUtils.detectChanges();
            await testUtils.clickElement('#settings');
            const activeLanguage: Language = userSettingsService.getLanguage();
            const candidateLanguage: Language = activeLanguage === 'en' ? 'fr' : 'en';
            await testUtils.selectChildElementOfDropDown('#language', 'language_' + candidateLanguage);
            testUtils.expectElementToExist('#language-change-warning');

            // When closing settings without choosing a warning action
            await testUtils.clickElement('#close-settings-backdrop');

            // Then settings close without persisting the candidate
            testUtils.expectElementNotToExist('#settings-modal');
            expect(userSettingsService.activateLanguage).not.toHaveBeenCalled();
            expect(userSettingsService.scheduleLanguageChange).not.toHaveBeenCalled();
        }));

        it('should close settings when applying a language next time', fakeAsync(async() => {
            // Given settings are open with a candidate language awaiting confirmation
            const userSettingsService: UserSettingsService = TestBed.inject(UserSettingsService);
            spyOn(userSettingsService, 'scheduleLanguageChange').and.callThrough();
            testUtils.detectChanges();
            await testUtils.clickElement('#settings');
            const activeLanguage: Language = userSettingsService.getLanguage();
            const candidateLanguage: Language = activeLanguage === 'en' ? 'fr' : 'en';
            await testUtils.selectChildElementOfDropDown('#language', 'language_' + candidateLanguage);

            // When choosing to apply the language next time
            await testUtils.clickElement('#apply-language-next-time');

            // Then the candidate is deferred and settings close, returning to the current page
            expect(userSettingsService.scheduleLanguageChange).toHaveBeenCalledOnceWith(candidateLanguage);
            expect(localStorage.getItem('pendingLocale')).toBe(candidateLanguage);
            testUtils.expectElementNotToExist('#settings-modal');
        }));
    });

    describe('disconnection', () => {
        it('should disconnect when connected user clicks on the logout button', fakeAsync(async() => {
            // Given a connected user
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            spyOn(TestBed.inject(ConnectedUserService), 'disconnect').and.callThrough();
            await testUtils.clickElement('#logout');
            tick(0);
            expect(TestBed.inject(ConnectedUserService).disconnect).toHaveBeenCalledTimes(1);
        }));

        it('should remove comment in header when disconnecting', fakeAsync(async() => {
            // Given a connected user that has a currentGame
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            const currentGame: CurrentGame = CurrentGameMocks.CANDIDATE;
            CurrentGameServiceMock.setCurrentGame(MGPOptional.of(currentGame));
            testUtils.detectChanges();
            tick(0);
            testUtils.expectElementToExist('#currentGameLink');

            // When connectedUserService informs us that user is disconnected
            ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
            CurrentGameServiceMock.setCurrentGame(MGPOptional.empty());
            testUtils.detectChanges();

            // Then currentGameLink should not be displayed
            testUtils.expectElementNotToExist('#currentGameLink');
        }));

    });

    it('should have empty username when user is not connected', fakeAsync(async() => {
        ConnectedUserServiceMock.setUser(AuthUser.NOT_CONNECTED);
        testUtils.detectChanges();
        tick(0);
        expect(testUtils.getComponent().username()).toEqual(MGPOptional.empty());
    }));

    it('should show user email if the user has not set its username yet', fakeAsync(async() => {
        const email: string = 'jean@jaja.us';
        ConnectedUserServiceMock.setUser(new AuthUser('id', MGPOptional.of(email), MGPOptional.empty(), false));
        testUtils.detectChanges();
        expect(testUtils.getComponent().username()).toEqual(MGPOptional.of(email));
    }));

    it('should redirect to your current part when clicking on its reference on the header', fakeAsync(async() => {
        // Given a component where connected user is observing a part
        ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
        const currentGame: CurrentGame = CurrentGameMocks.CREATOR_WITH_OPPONENT;
        CurrentGameServiceMock.setCurrentGame(MGPOptional.of(currentGame));
        testUtils.detectChanges();
        tick(0);

        // When clicking on the info about the part
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo(true);
        await testUtils.clickElement('#currentGameLink');

        // Then it should have redirect to the part
        expect(router.navigate).toHaveBeenCalledOnceWith(['/play', currentGame.gameName, currentGame.id]);
    }));

    describe('currentGame', () => {
        it('should display "<GameName> (waiting for opponent)" when creator without chosenOpponent', fakeAsync(async() => {
            // Given a connected user that has no currentGame
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick(0);
            testUtils.expectElementNotToExist('#currentGameLink');

            // When user become linked to a currentGame
            const currentGame: CurrentGame = CurrentGameMocks.CREATOR_WITHOUT_OPPONENT;
            CurrentGameServiceMock.setCurrentGame(MGPOptional.of(currentGame));
            testUtils.detectChanges();
            tick(0);

            // Then "Four in a Row (waiting for opponent)" should be displayed
            const currentGameLink: DebugElement = testUtils.findElement('#currentGameLink');
            const gameName: string = GameInfo.getByUrlName(currentGame.gameName).get().name;
            expect(currentGameLink.nativeElement.innerText).toEqual(gameName + ' (waiting for opponent)');
        }));

        it('should display "<GameName> against <Opponent>" when creator with chosenOpponent', fakeAsync(async() => {
            // Given a connected user that has no currentGame
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick(0);
            testUtils.expectElementNotToExist('#currentGameLink');

            // When user become linked to a currentGame as creator with an opponent set
            const currentGame: CurrentGame = CurrentGameMocks.CREATOR_WITH_OPPONENT;
            CurrentGameServiceMock.setCurrentGame(MGPOptional.of(currentGame));
            testUtils.detectChanges();
            tick(0);

            // Then "<Game> against <Opponent>" should be displayed
            const currentGameLink: DebugElement = testUtils.findElement('#currentGameLink');
            const gameName: string = GameInfo.getByUrlName(currentGame.gameName).get().name;
            const opponentName: string = Utils.getNonNullable(currentGame.opponent?.name);
            expect(currentGameLink.nativeElement.innerText).toEqual(gameName + ' against ' + opponentName);
        }));

        it(`should display '<GameName> against <Creator>' when chosen opponent`, fakeAsync(async() => {
            // Given a connected user that has no currentGame
            ConnectedUserServiceMock.setUser(UserMocks.OPPONENT_AUTH_USER);
            testUtils.detectChanges();
            tick(0);
            testUtils.expectElementNotToExist('#currentGameLink');

            // When user becomes linked to a game where they are the chosen opponent
            const currentGame: CurrentGame = CurrentGameMocks.CHOSEN_OPPONENT;
            CurrentGameServiceMock.setCurrentGame(MGPOptional.of(currentGame));
            testUtils.detectChanges();
            tick(0);

            // Then "<Game> against <Creator>" should be displayed
            const currentGameLink: DebugElement = testUtils.findElement('#currentGameLink');
            const gameName: string = GameInfo.getByUrlName(currentGame.gameName).get().name;
            expect(currentGameLink.nativeElement.innerText).toEqual(gameName + ' against ' + currentGame.creator.name);
        }));

        it(`should display '<GameName> by <Creator>' when watching as observer`, fakeAsync(async() => {
            // Given a connected user that has no currentGame
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick(0);
            testUtils.expectElementNotToExist('#currentGameLink');

            // When user become linked to a currentGame as an observer
            const currentGame: CurrentGame = CurrentGameMocks.OBSERVER;
            CurrentGameServiceMock.setCurrentGame(MGPOptional.of(currentGame));
            testUtils.detectChanges();
            tick(0);

            // Then "<GameName> by <Creator>" should be displayed
            const currentGameLink: DebugElement = testUtils.findElement('#currentGameLink');
            const gameName: string = GameInfo.getByUrlName(currentGame.gameName).get().name;
            expect(currentGameLink.nativeElement.innerText).toEqual(gameName + ' by ' + currentGame.creator.name);
        }));

        it(`should display '<GameName> by <Creator>' when watching as candidate without opponent`, fakeAsync(async() => {
            // Given a connected user that has no currentGame
            ConnectedUserServiceMock.setUser(UserMocks.CONNECTED_AUTH_USER);
            testUtils.detectChanges();
            tick(0);
            testUtils.expectElementNotToExist('#currentGameLink');

            // When user become linked to a currentGame
            const currentGame: CurrentGame = CurrentGameMocks.CANDIDATE;
            CurrentGameServiceMock.setCurrentGame(MGPOptional.of(currentGame));
            testUtils.detectChanges();
            tick(0);

            // Then "<GameName> by <Creator>" should be displayed
            const currentGameLink: DebugElement = testUtils.findElement('#currentGameLink');
            const gameName: string = GameInfo.getByUrlName(currentGame.gameName).get().name;
            expect(currentGame.opponent).toBeNull();
            expect(currentGameLink.nativeElement.innerText).toEqual(gameName + ' by ' + currentGame.creator.name);
        }));

    });

    it('should unsubscribe from connectedUserService when destroying component', fakeAsync(async() => {
        // Given a header
        const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
        const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(connectedUserService, 'subscribeToUser');
        testUtils.detectChanges();

        // When it is destroyed
        testUtils.getComponent().ngOnDestroy();

        // Then it should have unsubscribed from connected user
        // Because well, we destroy the header a LOT!
        // By hitting it in the ... HEAD.
        expectUnsubscribeToHaveBeenCalled();
    }));

    it('should unsubscribe from currentGameService when destroying component', fakeAsync(async() => {
        // Given a header
        const currentGameService: CurrentGameService = TestBed.inject(CurrentGameService);
        const expectUnsubscribeToHaveBeenCalled: () => void = prepareUnsubscribeCheck(currentGameService, 'subscribeToCurrentGame');
        testUtils.detectChanges();

        // When it is destroyed
        testUtils.getComponent().ngOnDestroy();

        // Then it should have unsubscribed from observed part
        expectUnsubscribeToHaveBeenCalled();
    }));
});
