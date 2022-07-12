/* eslint-disable max-lines-per-function */
import { DebugElement } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ConnectedUserService } from 'src/app/services/ConnectedUserService';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { expectValidRouting, expectValidRoutingLink, SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { LocalGameWrapperComponent } from '../../wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { TutorialGameWrapperComponent } from '../../wrapper-components/tutorial-game-wrapper/tutorial-game-wrapper.component';
import { LobbyComponent, GameActionFailure } from '../lobby/lobby.component';
import { OnlineGameCreationComponent } from '../online-game-creation/online-game-creation.component';
import { OnlineGameSelectionComponent } from '../online-game-selection/online-game-selection.component';
import { WelcomeComponent } from './welcome.component';

fdescribe('WelcomeComponent', () => {

    let testUtils: SimpleComponentTestUtils<WelcomeComponent>;

    beforeEach(fakeAsync(async() => {
        testUtils = await SimpleComponentTestUtils.create(WelcomeComponent);
        testUtils.detectChanges();
    }));
    it('should create', () => {
        expect(testUtils.getComponent()).toBeTruthy();
    });
    it('should redirect to online game creation when clicking on the corresponding button', fakeAsync(async() => {
        // Given a welcome component
        // where ConnectedUserService tell us user cannot join a game
        const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
        spyOn(connectedUserService, 'canUserCreate').and.returnValue(MGPValidation.SUCCESS);
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        await testUtils.clickElement('#playOnline_Awale');
        testUtils.detectChanges();

        expectValidRouting(router, ['/play', 'Awale'], OnlineGameCreationComponent);
    }));
    it('should not redirect to online game creation when clicking on the corresponding button while in a game', fakeAsync(async() => {
        // Given a welcome component
        // where ConnectedUserService tell us user cannot join a game
        const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
        const error: string = `j'ai dit non!`;
        spyOn(connectedUserService, 'canUserCreate').and.returnValue(MGPValidation.failure(error));
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.callThrough();

        // When clicking on the online-button of one game
        const component: WelcomeComponent = testUtils.getComponent();
        spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
        await testUtils.clickElement('#playOnline_Awale');
        tick(3000);

        // Then the component should not have changed page and toast the reason
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(error);
    }));
    it('should redirect to local game when clicking on the corresponding button', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        await testUtils.clickElement('#playLocally_Awale');
        testUtils.detectChanges();

        expectValidRouting(router, ['/local', 'Awale'], LocalGameWrapperComponent);
    }));
    it('should redirect to tutorial when clicking on the corresponding button', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');

        await testUtils.clickElement('#startTutorial_Awale');

        expectValidRouting(router, ['/tutorial', 'Awale'], TutorialGameWrapperComponent);
    }));
    it('should redirect to lobby when clicking on the corresponding button', fakeAsync(async() => {
        const button: DebugElement = testUtils.findElement('#seeGameList');
        expectValidRoutingLink(button, '/lobby', LobbyComponent);
    }));
    it('should redirect to part selection when clicking on the corresponding button', fakeAsync(async() => {
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.callThrough();

        await testUtils.clickElement('#createOnlineGame');

        expectValidRouting(router, ['/play'], OnlineGameSelectionComponent);
    }));
    it('should not redirect to part selection when clicking on the corresponding button while already playing', fakeAsync(async() => {
        // Given a welcome component
        // where ConnectedUserService tell us user cannot join a game
        const connectedUserService: ConnectedUserService = TestBed.inject(ConnectedUserService);
        const error: string = `j'ai dit non!`;
        spyOn(connectedUserService, 'canUserCreate').and.returnValue(MGPValidation.failure(error));
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.callThrough();

        // When clicking on the online-button of one game
        const component: WelcomeComponent = testUtils.getComponent();
        spyOn(component.messageDisplayer, 'criticalMessage').and.callThrough();
        await testUtils.clickElement('#createOnlineGame');
        tick(3000);

        // Then the component should not have changed page and toast the reason
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.messageDisplayer.criticalMessage).toHaveBeenCalledOnceWith(error);
    }));
    describe('game list', () => {
        it('should open a modal dialog when clicking on a game image', fakeAsync(async() => {
            // Given that the page is loaded

            // When clicking on the info for a game
            await testUtils.clickElement('#image_Awale');

            // Then the modal dialog is shown
            testUtils.expectElementToExist('#gameInfoModal');
        }));
        it('should close the modal dialog when clicking anywhere on its background', fakeAsync(async() => {
            // Given that the modal dialog is shown for a game
            await testUtils.clickElement('#image_Awale');

            // When clicking on its background
            await testUtils.clickElement('#modalBackground');

            // Then the modal dialog disappears
            testUtils.expectElementNotToExist('#gameInfoModal');
        }));
        it('should close the modal dialog when clicking anywhere on its close button', fakeAsync(async() => {
            // Given that the modal dialog is shown for a game
            await testUtils.clickElement('#image_Awale');

            // When clicking on its close button
            await testUtils.clickElement('#closeInfo');

            // Then the modal dialog disappears
            testUtils.expectElementNotToExist('#gameInfoModal');
        }));
    });
});
