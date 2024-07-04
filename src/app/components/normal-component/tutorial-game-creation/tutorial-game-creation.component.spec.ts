/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SimpleComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';

import { TutorialGameCreationComponent } from './tutorial-game-creation.component';

describe('TutorialGameCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<TutorialGameCreationComponent>;

    beforeEach(async() => {
        testUtils = await SimpleComponentTestUtils.create(TutorialGameCreationComponent);
    });

    it('should create and redirect to chosen game', fakeAsync(async() => {
        // Given a selection component
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo(true);

        // When picking a game
        await testUtils.getComponent().pickGame('whateverGame');

        // Then the user is redirected to its tutorial
        expect(testUtils.getComponent().router.navigate).toHaveBeenCalledOnceWith(['/tutorial/', 'whateverGame']);
    }));
});
