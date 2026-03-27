/* eslint-disable max-lines-per-function */
import { fakeAsync, TestBed } from '@angular/core/testing';

import { SimpleComponentTestUtils } from '../../../utils/tests/TestUtils.spec';

import { LocalGameCreationComponent } from './local-game-creation.component';
import { Router } from '@angular/router';

describe('LocalGameCreationComponent', () => {

    let testUtils: SimpleComponentTestUtils<LocalGameCreationComponent>;

    beforeEach(async() => {
        testUtils = await SimpleComponentTestUtils.create(LocalGameCreationComponent);
        testUtils.detectChanges();
    });
    it('should create and redirect to chosen game', fakeAsync(async() => {
        // Given a local game creation component
        const router: Router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        // When picking a game
        await testUtils.getComponent().pickGame('whateverGame');
        // Then we should navigate to that game
        expect(router.navigate).toHaveBeenCalledOnceWith(['/local', 'whateverGame', 'config']);
    }));
});
